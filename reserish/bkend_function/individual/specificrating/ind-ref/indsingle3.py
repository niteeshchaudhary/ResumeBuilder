import os
import docx2txt
import PyPDF2
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity


load_dotenv()
api_keys= os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_keys)

# Define function to extract text from PDF
def extract_text_from_pdf(file_path):
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = "".join([page.extract_text() for page in reader.pages])
        return text
    except Exception:
        return ""

# Function to clean text by removing empty lines
def clean_text_docx(text):
    cleaned_lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(cleaned_lines)

# Function to extract and clean text from a DOCX file
def extract_text_from_docx(docx_path):
    try:
        text = docx2txt.process(docx_path)
    except:
        text = ""
    return clean_text_docx(text)

# Function to get embeddings
def get_embeddings(texts):
    if not texts.strip():  # Check if text is empty
        raise ValueError("Invalid input: 'content' argument must not be empty.")
    output = genai.embed_content(
            model="models/embedding-001",
            content=texts,
        )
    return output['embedding']


# Function to rate resume
def rate_resume(resume_text, job_description):

    if not resume_text.strip() or not job_description.strip():
        raise ValueError("Resume text and job description must not be empty.")

    resume_embeddings = get_embeddings(resume_text)
    job_embeddings = get_embeddings(job_description)
    
    resume_embeddings = np.array(resume_embeddings).reshape(1, -1)
    job_embeddings = np.array(job_embeddings).reshape(1, -1)
    
    similarity = cosine_similarity(resume_embeddings, job_embeddings)
    rating = similarity[0][0] * 10 
    
    return rating


if __name__ == '__main__':

    job_description = "full stack developer"
    job_description1 = 'product manager'
    job_description2 = "backend developer"
    job_description3 = "frontend developer"
    job_description4 = "data analyst"
    job_description5 = "business analyst"



    pdf_text = extract_text_from_pdf('ICICI Bank Resume - Sattwik Mishra.pdf')
    print('Printing pdf text =-----------------------------------------------')
    print(pdf_text)


    # docx_text = extract_text_from_docx('ICICI_SiddharthPatra - Siddharth Patra.docx')
    # print('Printing docx text =-----------------------------------------------')
    # print(docx_text)


    rating = rate_resume(pdf_text, job_description)  
    print(f"Resume Rating: {rating:.2f}/10")   

    rating = rate_resume(pdf_text, job_description1)  
    print(f"Resume Rating: {rating:.2f}/10")   

    rating = rate_resume(pdf_text, job_description2)  
    print(f"Resume Rating: {rating:.2f}/10")   

    rating = rate_resume(pdf_text, job_description3)  
    print(f"Resume Rating: {rating:.2f}/10")   

    rating = rate_resume(pdf_text, job_description4)  
    print(f"Resume Rating: {rating:.2f}/10")   

    rating = rate_resume(pdf_text, job_description5)  
    print(f"Resume Rating: {rating:.2f}/10")   

 



