"""
Google Calendar Service for Interview Scheduling
Creates real calendar events with Google Meet links
"""

import os
import json
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from django.core.cache import cache

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

class GoogleCalendarService:
    """Service for managing Google Calendar events and Google Meet links"""
    
    def __init__(self):
        self.creds = None
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Calendar API"""
        # The file token.json stores the user's access and refresh tokens
        token_path = os.path.join(settings.BASE_DIR, 'token.json')
        credentials_path = os.path.join(settings.BASE_DIR, 'credentials.json')
        
        # Check if we have valid credentials
        if os.path.exists(token_path):
            self.creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
        # If there are no (valid) credentials available, let the user log in
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                if os.path.exists(credentials_path):
                    flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                    self.creds = flow.run_local_server(port=0)
                else:
                    # Use service account credentials if available
                    service_account_path = os.path.join(settings.BASE_DIR, 'service-account.json')
                    if os.path.exists(service_account_path):
                        from google.oauth2 import service_account
                        self.creds = service_account.Credentials.from_service_account_file(
                            service_account_path, scopes=SCOPES
                        )
                    else:
                        raise Exception("No Google credentials found. Please set up credentials.json or service-account.json")
            
            # Save the credentials for the next run
            if not os.path.exists('token.json'):
                with open(token_path, 'w') as token:
                    token.write(self.creds.to_json())
        
        # Build the service
        self.service = build('calendar', 'v3', credentials=self.creds)
    
    def create_interview_event(self, user_email, user_name, slot_date, start_time, end_time, duration_minutes, notes=""):
        """
        Create a real Google Calendar event with Google Meet
        
        Args:
            user_email: User's email address
            user_name: User's name
            slot_date: Date of the interview
            start_time: Start time
            end_time: End time
            duration_minutes: Duration in minutes
            notes: Interview notes/topics
        
        Returns:
            dict: Event details including Google Meet link
        """
        try:
            # Combine date and time
            start_datetime = datetime.combine(slot_date, start_time)
            end_datetime = datetime.combine(slot_date, end_time)
            
            # Format for Google Calendar
            start_iso = start_datetime.isoformat() + 'Z'
            end_iso = end_datetime.isoformat() + 'Z'
            
            # Event description
            description = f"""
Interview Practice Session

👤 Participant: {user_name} ({user_email})
🎯 Duration: {duration_minutes} minutes
📝 Topics: {notes or 'General interview practice'}

Please join the Google Meet link below 5 minutes before your scheduled time.

Best regards,
Reserish Team
            """.strip()
            
            # Create the event
            event = {
                'summary': f'Interview Practice - {user_name}',
                'description': description,
                'start': {
                    'dateTime': start_iso,
                    'timeZone': 'Asia/Kolkata',
                },
                'end': {
                    'dateTime': end_iso,
                    'timeZone': 'Asia/Kolkata',
                },
                'attendees': [
                    {'email': user_email},
                    {'email': 'reserish@gmail.com'},  # Team email
                ],
                'conferenceData': {
                    'createRequest': {
                        'requestId': f'interview-{user_email}-{start_datetime.strftime("%Y%m%d-%H%M")}',
                        'conferenceSolutionKey': {
                            'type': 'hangoutsMeet'
                        }
                    }
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 15},       # 15 minutes before
                    ],
                },
            }
            
            # Insert the event with Google Meet integration
            # Try primary calendar first, then fallback to user's calendar
            try:
                event = self.service.events().insert(
                    calendarId='primary',
                    body=event,
                    conferenceDataVersion=1,
                    sendUpdates='all'
                ).execute()
                print(f"✅ Event created in primary calendar")
            except Exception as e:
                print(f"⚠️ Failed to create in primary calendar: {e}")
                # Try user's calendar
                try:
                    event = self.service.events().insert(
                        calendarId=user_email,
                        body=event,
                        conferenceDataVersion=1,
                        sendUpdates='all'
                    ).execute()
                    print(f"✅ Event created in user's calendar")
                except Exception as e2:
                    print(f"❌ Failed to create in user's calendar: {e2}")
                    raise e2
            
            print(f"🔍 Debug: Created event ID: {event['id']}")
            print(f"🔍 Debug: Full event response: {event}")
            
            # Extract Google Meet link - Google should provide this automatically
            meet_link = None
            meeting_id = None
            
            print(f"🔍 Debug: Event conference data: {event.get('conferenceData', 'Not found')}")
            
            # Check if Google Meet was created
            if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
                for entry_point in event['conferenceData']['entryPoints']:
                    print(f"🔍 Debug: Entry point: {entry_point}")
                    if entry_point['entryPointType'] == 'video':
                        meet_link = entry_point['uri']
                        # Extract meeting ID from the URI (e.g., from https://meet.google.com/abc-defg-hij)
                        if meet_link and 'meet.google.com/' in meet_link:
                            meeting_id = meet_link.split('meet.google.com/')[-1]
                        else:
                            meeting_id = event.get('conferenceData', {}).get('conferenceId', '')
                        print(f"✅ Found Google Meet link: {meet_link}")
                        print(f"✅ Extracted meeting ID: {meeting_id}")
                        break
            
            # Fallback: Check for hangoutLink (older Google Meet format)
            if not meet_link and 'hangoutLink' in event:
                meet_link = event['hangoutLink']
                if meet_link and 'meet.google.com/' in meet_link:
                    meeting_id = meet_link.split('meet.google.com/')[-1]
                print(f"✅ Found hangoutLink: {meet_link}")
                print(f"✅ Extracted meeting ID from hangoutLink: {meeting_id}")
            
            # If no Google Meet link, try to add it explicitly
            if not meet_link:
                print("⚠️ No Google Meet link found, trying to add it explicitly...")
                
                # Try to add Google Meet to the existing event
                try:
                    update_body = {
                        'conferenceData': {
                            'createRequest': {
                                'requestId': f'meet-{event["id"]}',
                                'conferenceSolutionKey': {
                                    'type': 'hangoutsMeet'
                                }
                            }
                        }
                    }
                    
                    print(f"🔍 Debug: Updating event with Google Meet request: {update_body}")
                    
                    updated_event = self.service.events().patch(
                        calendarId='primary',
                        eventId=event['id'],
                        body=update_body,
                        conferenceDataVersion=1
                    ).execute()
                    
                    print(f"🔍 Debug: Updated event: {updated_event}")
                    
                    # Check for Google Meet link again
                    if 'conferenceData' in updated_event and 'entryPoints' in updated_event['conferenceData']:
                        for entry_point in updated_event['conferenceData']['entryPoints']:
                            if entry_point['entryPointType'] == 'video':
                                meet_link = entry_point['uri']
                                # Extract meeting ID from the URI
                                if meet_link and 'meet.google.com/' in meet_link:
                                    meeting_id = meet_link.split('meet.google.com/')[-1]
                                else:
                                    meeting_id = updated_event.get('conferenceData', {}).get('conferenceId', '')
                                print(f"✅ Got Google Meet link after update: {meet_link}")
                                print(f"✅ Extracted meeting ID: {meet_link}")
                                break
                
                except Exception as e:
                    print(f"❌ Failed to add Google Meet: {e}")
            
            # If still no Meet link, this is a serious issue
            if not meet_link:
                print("❌ CRITICAL: Google Meet link not generated!")
                print("   This means Google Calendar API is not working properly")
                print("   Please check Google Workspace settings and API permissions")
                
                # Don't create fake links - return error
                return {
                    'success': False,
                    'error': 'Google Meet link could not be generated. Please check Google Workspace settings.',
                    'event_id': event['id'],
                    'event_link': event['htmlLink']
                }
            
            return {
                'success': True,
                'event_id': event['id'],
                'meet_link': meet_link,
                'meeting_id': meeting_id,
                'event_link': event['htmlLink'],
                'start_time': start_iso,
                'end_time': end_iso,
                'attendees': [attendee['email'] for attendee in event.get('attendees', [])],
                'is_real_meet_link': True
            }
            
        except HttpError as error:
            print(f'An error occurred: {error}')
            return {
                'success': False,
                'error': str(error)
            }
        except Exception as e:
            print(f'Unexpected error: {e}')
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_event(self, event_id, **kwargs):
        """Update an existing calendar event"""
        try:
            event = self.service.events().get(calendarId='primary', eventId=event_id).execute()
            
            # Update fields
            for key, value in kwargs.items():
                if key in event:
                    event[key] = value
            
            updated_event = self.service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event
            ).execute()
            
            return {
                'success': True,
                'event': updated_event
            }
            
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def delete_event(self, event_id):
        """Delete a calendar event"""
        try:
            self.service.events().delete(calendarId='primary', eventId=event_id).execute()
            return {'success': True}
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }
    
    def get_event(self, event_id):
        """Get event details"""
        try:
            event = self.service.events().get(calendarId='primary', eventId=event_id).execute()
            return {
                'success': True,
                'event': event
            }
        except HttpError as error:
            return {
                'success': False,
                'error': str(error)
            }

# Global instance
google_calendar_service = GoogleCalendarService()
