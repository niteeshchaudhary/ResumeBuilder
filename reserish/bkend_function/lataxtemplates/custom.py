from datetime import datetime
from bkend_function.individual.overallrating.groq_api_manager import groq_manager
from django.conf import settings
import re

def clean_latex_output(text: str) -> str:
    if not text:
        return ""
    # Remove ```latex ... ``` or ``` ... ``` wrappers
    return re.sub(r"^```(?:latex)?\n?|```$", "", text.strip(), flags=re.MULTILINE).strip()

def adjust_template(prompt, token_size=2000):
    try:
        response = groq_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=token_size,
        )
        return clean_latex_output(response.choices[0].message.content.strip())

    except Exception as e:
        print("Error querying Groq API:-", e)
        return None
    
class CustomGenerator:
    def __init__(self, data,user):
        self.user=user
        self.data = data
        self.content = []
        self._load_template_parts()
        
    def _load_template_parts(self):
        with open(f"{settings.MEDIA_PUBLIC}/sb2.tex", 'r') as file:
            self.template = file.read()
    def generate(self):
        output= adjust_template(f"Generate a professional resume in LaTeX format using the provided data. Ensure the resume is well-structured, visually appealing, and highlights key skills and experiences effectively. Use appropriate LaTeX formatting for sections, bullet points, and headings. Only provide the LaTeX code without any additional explanations or text.Template {self.template}, user data: {self.data},don't show full links instead use thumbnails and icons, respect margin inputs  and maintain proper spacing between two sub sections(like between two or more education,experience etc) and no spacing between bullet points and their heading, if it contains logo or profile pic use ../../{self.user.profile_picture}",token_size=4000)
        print(output)
        return output

def custom(data,user={"name":"User"}):
    print(user.profile_picture,"****")
    generator = CustomGenerator(data,user)
    return generator.generate()