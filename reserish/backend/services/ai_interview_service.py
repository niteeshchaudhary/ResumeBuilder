import json
import logging
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import sys
import os

# Add the path to the GROQ API manager
sys.path.append(os.path.join(settings.BASE_DIR, 'bkend_function', 'individual', 'overallrating'))

try:
    from groq_api_manager_round_robin import groq_round_robin_manager
    GROQ_AVAILABLE = True
except ImportError:
    try:
        from groq_api_manager import groq_manager
        GROQ_AVAILABLE = True
    except ImportError:
        GROQ_AVAILABLE = False
        logging.warning("GROQ API manager not available. AI interview features will be limited.")

logger = logging.getLogger(__name__)


class AIInterviewService:
    """Service for managing AI-powered interview functionality"""
    
    def __init__(self):
        self.groq_available = GROQ_AVAILABLE
        if self.groq_available:
            try:
                # Try to use the round-robin manager first, fallback to regular manager
                if 'groq_round_robin_manager' in globals():
                    self.groq_manager = groq_round_robin_manager
                else:
                    self.groq_manager = groq_manager
                logger.info("GROQ API manager initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize GROQ API manager: {e}")
                self.groq_available = False
        else:
            logger.warning("GROQ API manager not available")
    
    def generate_interview_questions(self, job_description: str, user_resume_summary: str, 
                                   question_count: int = 5, difficulty: str = 'medium') -> List[Dict]:
        """
        Generate AI-powered interview questions based on job description and user resume
        
        Args:
            job_description: The job description to base questions on
            user_resume_summary: Summary of user's resume/background
            question_count: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
        
        Returns:
            List of question dictionaries with text, type, and context
        """
        if not self.groq_available:
            return self._get_fallback_questions(question_count)
        
        try:
            prompt = self._create_question_generation_prompt(
                job_description, user_resume_summary, question_count, difficulty
            )
            
            response = self.groq_manager.make_request(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Extract content from GROQ response
            response_content = response.choices[0].message.content.strip()
            
            # Parse the response to extract questions
            questions = self._parse_questions_from_response(response_content)
            
            if not questions:
                logger.warning("Failed to parse questions from GROQ response, using fallback")
                return self._get_fallback_questions(question_count)
            
            return questions[:question_count]
            
        except Exception as e:
            logger.error(f"Error generating questions with GROQ: {e}")
            return self._get_fallback_questions(question_count)
    
    def evaluate_user_response(self, question: str, user_response: str, 
                             expected_points: List[str], job_context: str) -> Dict:
        """
        Evaluate a user's response to an interview question using AI
        
        Args:
            question: The question that was asked
            user_response: User's verbal response
            expected_points: Key points expected in the answer
            job_context: Job description for context
        
        Returns:
            Dictionary with evaluation results
        """
        if not self.groq_available:
            return self._get_fallback_evaluation(question, user_response)
        
        try:
            prompt = self._create_evaluation_prompt(
                question, user_response, expected_points, job_context
            )
            
            response = self.groq_manager.make_request(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Extract content from GROQ response
            response_content = response.choices[0].message.content.strip()
            
            # Parse the evaluation response
            evaluation = self._parse_evaluation_from_response(response_content)
            
            if not evaluation:
                logger.warning("Failed to parse evaluation from GROQ response, using fallback")
                return self._get_fallback_evaluation(question, user_response)
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating response with GROQ: {e}")
            return self._get_fallback_evaluation(question, user_response)
    
    def generate_follow_up_question(self, previous_question: str, user_response: str, 
                                  job_context: str) -> Optional[str]:
        """
        Generate a follow-up question based on the user's previous response
        
        Args:
            previous_question: The previous question asked
            user_response: User's response to the previous question
            job_context: Job description for context
        
        Returns:
            Follow-up question text or None if unable to generate
        """
        if not self.groq_available:
            return None
        
        try:
            prompt = self._create_follow_up_prompt(previous_question, user_response, job_context)
            
            response = self.groq_manager.make_request(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=300
            )
            
            # Extract content from GROQ response
            response_content = response.choices[0].message.content.strip()
            
            # Extract the follow-up question
            follow_up = self._extract_follow_up_question(response_content)
            return follow_up if follow_up else None
            
        except Exception as e:
            logger.error(f"Error generating follow-up question with GROQ: {e}")
            return None
    
    def generate_interview_summary(self, conversation_data: List[Dict], 
                                 job_description: str) -> Dict:
        """
        Generate a comprehensive summary and evaluation of the entire interview
        
        Args:
            conversation_data: List of all question-answer pairs
            job_description: Job description for context
        
        Returns:
            Dictionary with overall evaluation and recommendations
        """
        if not self.groq_available:
            return self._get_fallback_summary(conversation_data)
        
        try:
            prompt = self._create_summary_prompt(conversation_data, job_description)
            
            response = self.groq_manager.make_request(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=1200
            )
            
            # Extract content from GROQ response
            response_content = response.choices[0].message.content.strip()
            
            # Parse the summary response
            summary = self._parse_summary_from_response(response_content)
            
            if not summary:
                logger.warning("Failed to parse summary from GROQ response, using fallback")
                return self._get_fallback_summary(conversation_data)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating interview summary with GROQ: {e}")
            return self._get_fallback_summary(conversation_data)
    
    def _create_question_generation_prompt(self, job_description: str, user_resume_summary: str, 
                                         question_count: int, difficulty: str) -> str:
        """Create prompt for generating interview questions"""
        return f"""
You are an expert HR interviewer. Generate {question_count} interview questions for a {difficulty} difficulty level.

Job Description:
{job_description}

Candidate Background:
{user_resume_summary}

Requirements:
1. Generate a mix of behavioral, technical, and situational questions
2. Questions should be relevant to the job role and candidate's background
3. Include questions that test both hard and soft skills
4. Make questions conversational and human-like
5. Avoid generic questions - make them specific to the role

Format your response as a JSON array with this structure:
[
  {{
    "question_text": "The actual question text",
    "question_type": "behavioral|technical|situational|general",
    "difficulty_level": "{difficulty}",
    "skills_required": ["skill1", "skill2"],
    "expected_answer_points": ["point1", "point2", "point3"],
    "follow_up_potential": true/false
  }}
]

Generate exactly {question_count} questions. Focus on quality and relevance.
"""
    
    def _create_evaluation_prompt(self, question: str, user_response: str, 
                                expected_points: List[str], job_context: str) -> str:
        """Create prompt for evaluating user responses"""
        return f"""
You are an expert HR interviewer evaluating a candidate's response. Provide a comprehensive evaluation.

Question: {question}
User Response: {user_response}
Expected Key Points: {', '.join(expected_points)}
Job Context: {job_context}

Evaluate the response and provide:
1. A score from 1-10
2. Specific feedback on what was good and what could be improved
3. Identify strengths in the response
4. Suggest specific improvements
5. Recommend follow-up questions if needed

Format your response as JSON:
{{
  "score": 8,
  "feedback": "Detailed feedback text",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "follow_up_questions": ["follow_up1", "follow_up2"],
  "overall_assessment": "Brief overall assessment"
}}

Be constructive and specific in your feedback.
"""
    
    def _create_follow_up_prompt(self, previous_question: str, user_response: str, 
                                job_context: str) -> str:
        """Create prompt for generating follow-up questions"""
        return f"""
Based on the candidate's response, generate a natural follow-up question to dig deeper.

Previous Question: {previous_question}
User Response: {user_response}
Job Context: {job_context}

Generate ONE follow-up question that:
1. Builds naturally on their response
2. Helps you understand their experience better
3. Is relevant to the job role
4. Sounds conversational and human-like

Return only the question text, nothing else.
"""
    
    def _create_summary_prompt(self, conversation_data: List[Dict], job_description: str) -> str:
        """Create prompt for generating interview summary"""
        return f"""
You are an expert HR interviewer. Provide a comprehensive evaluation of this interview session.

Job Description: {job_description}

Interview Data:
{json.dumps(conversation_data, indent=2)}

Provide a complete evaluation including:
1. Overall score (1-10)
2. Key strengths demonstrated
3. Areas for improvement
4. Specific recommendations
5. Overall assessment

Format your response as JSON:
{{
  "overall_score": 8,
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["area1", "area2"],
  "recommendations": "Detailed recommendations text",
  "overall_assessment": "Comprehensive assessment of the interview"
}}

Be thorough and constructive in your evaluation.
"""
    
    def _parse_questions_from_response(self, response: str) -> List[Dict]:
        """Parse questions from GROQ response"""
        try:
            # Try to extract JSON from the response
            if '```json' in response:
                json_start = response.find('```json') + 7
                json_end = response.find('```', json_start)
                json_str = response[json_start:json_end].strip()
            else:
                # Try to find JSON array in the response
                start = response.find('[')
                end = response.rfind(']') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                else:
                    return []
            
            questions = json.loads(json_str)
            if isinstance(questions, list):
                return questions
            return []
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse questions JSON: {e}")
            return []
    
    def _parse_evaluation_from_response(self, response: str) -> Dict:
        """Parse evaluation from GROQ response"""
        try:
            # Try to extract JSON from the response
            if '```json' in response:
                json_start = response.find('```json') + 7
                json_end = response.find('```', json_start)
                json_str = response[json_start:json_end].strip()
            else:
                # Try to find JSON object in the response
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                else:
                    return {}
            
            evaluation = json.loads(json_str)
            if isinstance(evaluation, dict):
                return evaluation
            return {}
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse evaluation JSON: {e}")
            return {}
    
    def _parse_summary_from_response(self, response: str) -> Dict:
        """Parse summary from GROQ response"""
        try:
            # Try to extract JSON from the response
            if '```json' in response:
                json_start = response.find('```json') + 7
                json_end = response.find('```', json_start)
                json_str = response[json_start:json_end].strip()
            else:
                # Try to find JSON object in the response
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                else:
                    return {}
            
            summary = json.loads(json_str)
            if isinstance(summary, dict):
                return summary
            return {}
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse summary JSON: {e}")
            return {}
    
    def _extract_follow_up_question(self, response: str) -> Optional[str]:
        """Extract follow-up question from response"""
        # Clean the response and extract the question
        lines = response.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('```'):
                # Remove any JSON formatting or extra text
                if line.startswith('"') and line.endswith('"'):
                    return line[1:-1]  # Remove quotes
                elif line.startswith('{') or line.startswith('['):
                    continue  # Skip JSON formatting
                else:
                    return line
        return None
    
    def _get_fallback_questions(self, question_count: int) -> List[Dict]:
        """Fallback questions when GROQ is not available"""
        fallback_questions = [
            {
                "question_text": "Tell me about yourself and your background.",
                "question_type": "general",
                "difficulty_level": "easy",
                "skills_required": ["communication", "self-awareness"],
                "expected_answer_points": ["professional background", "key achievements", "career goals"],
                "follow_up_potential": True
            },
            {
                "question_text": "What interests you most about this position?",
                "question_type": "behavioral",
                "difficulty_level": "easy",
                "skills_required": ["motivation", "research"],
                "expected_answer_points": ["role understanding", "company knowledge", "personal interest"],
                "follow_up_potential": True
            },
            {
                "question_text": "Describe a challenging project you've worked on.",
                "question_type": "behavioral",
                "difficulty_level": "medium",
                "skills_required": ["problem-solving", "project management"],
                "expected_answer_points": ["project description", "challenges faced", "solutions implemented", "outcomes"],
                "follow_up_potential": True
            },
            {
                "question_text": "How do you handle working under pressure?",
                "question_type": "situational",
                "difficulty_level": "medium",
                "skills_required": ["stress management", "time management"],
                "expected_answer_points": ["specific examples", "strategies used", "outcomes"],
                "follow_up_potential": True
            },
            {
                "question_text": "Where do you see yourself in 5 years?",
                "question_type": "behavioral",
                "difficulty_level": "easy",
                "skills_required": ["career planning", "goal setting"],
                "expected_answer_points": ["career goals", "skill development", "role progression"],
                "follow_up_potential": True
            }
        ]
        
        return fallback_questions[:question_count]
    
    def _get_fallback_evaluation(self, question: str, user_response: str) -> Dict:
        """Fallback evaluation when GROQ is not available"""
        # Simple keyword-based evaluation
        response_length = len(user_response.split())
        has_examples = any(word in user_response.lower() for word in ['example', 'experience', 'project', 'worked'])
        has_outcome = any(word in user_response.lower() for word in ['result', 'outcome', 'achieved', 'improved'])
        
        score = 5  # Base score
        
        if response_length > 20:
            score += 1
        if has_examples:
            score += 2
        if has_outcome:
            score += 2
        
        score = min(10, max(1, score))
        
        return {
            "score": score,
            "feedback": "Basic evaluation provided. For detailed feedback, ensure GROQ API is available.",
            "strengths": ["Response provided"] if user_response.strip() else [],
            "improvements": ["Could provide more specific examples", "Consider including outcomes"],
            "follow_up_questions": [],
            "overall_assessment": "Response evaluated with basic criteria"
        }
    
    def _get_fallback_summary(self, conversation_data: List[Dict]) -> Dict:
        """Fallback summary when GROQ is not available"""
        total_responses = len(conversation_data)
        avg_score = 6 if total_responses > 0 else 0
        
        return {
            "overall_score": avg_score,
            "strengths": ["Participated in interview"],
            "areas_for_improvement": ["Detailed feedback requires GROQ API"],
            "recommendations": "For comprehensive feedback, ensure GROQ API integration is working.",
            "overall_assessment": "Basic interview summary provided. Detailed evaluation requires AI integration."
        }


# Global instance
ai_interview_service = AIInterviewService()






