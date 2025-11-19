import os
import shutil
import re
import pdfplumber
import zipfile
import docx2txt
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from multiprocessing import Pool, cpu_count


# Function to clean resume text
def clean_resume(resume_text):
    resume_text = re.sub(r'http\S+\s*', ' ', resume_text) 
    resume_text = re.sub(r'RT|cc', ' ', resume_text)  
    resume_text = re.sub(r'#\S+', '', resume_text)  
    resume_text = re.sub(r'@\S+', '  ', resume_text)  
    resume_text = re.sub(r'[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[]^_`{|}~"""), ' ', resume_text)  
    resume_text = re.sub(r'[^\x00-\x7f]',r' ', resume_text)  
    resume_text = re.sub(r'\s+', ' ', resume_text)  
    return resume_text

# Function to extract and clean text from a PDF file
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text()
    except:
        pass
    return clean_resume(text)

# Function to extract and clean text from a DOCX file
def extract_text_from_docx(docx_path):
    try:
        text = docx2txt.process(docx_path)
    except:
        text = ""
    return clean_resume(text)

# Function to extract and clean text based on file extension
def extract_and_clean_file(file_path):
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        return ""

# Optimized function to load and process resumes from a list of files in parallel
def load_resumes_from_files_parallel(files):
    with Pool(cpu_count()) as pool:
        resume_texts = pool.map(extract_and_clean_file, files)
    return resume_texts

# Function to recommend top 'n' relevant resumes based on a job role
def recommend_resumes(job_role, resumes, filenames, output_folder, n=5):

    job_role_cleaned = clean_resume(job_role) 
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)  
    resume_tfidf = vectorizer.fit_transform(resumes)  
    job_role_tfidf = vectorizer.transform([job_role_cleaned])  
    
    cosine_similarities = cosine_similarity(job_role_tfidf, resume_tfidf).flatten()
    relevant_indices = cosine_similarities.argsort()[-n:][::-1]
    print(n,relevant_indices)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    shortlisted_files = []
    for idx in relevant_indices:
        resume_file = os.path.basename(filenames[idx])
        src_path = filenames[idx]
        dest_path = os.path.join(output_folder, resume_file)
        try:
            shutil.copy(src_path, dest_path)
        except Exception as e:
            print(f"Error copying file {src_path}: {e}")
        shortlisted_files.append(dest_path)
    
    return shortlisted_files, cosine_similarities[relevant_indices]

# Function to handle large-scale recommendation in batches
def process_large_scale_resumes(job_role, folder_path, output_folder, n=5, batch_size=100):
    all_files=[]
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            all_files.append(os.path.join(root, file))

    # all_files = [os.path.join(folder_path, file) for file in os.listdir(folder_path) if file.endswith(('.pdf', '.docx'))]
    total_files = len(all_files)
    
    batch_results = []
    for i in range(0, total_files, batch_size):
        batch_files = all_files[i:i+batch_size]        
        resumes = load_resumes_from_files_parallel(batch_files)        
        shortlisted_files, similarities = recommend_resumes(job_role, resumes, batch_files, output_folder, n=n)
        batch_results.extend(list(zip(shortlisted_files, similarities)))
    
    batch_results = sorted(batch_results, key=lambda x: x[1], reverse=True)[:n]
    
    return batch_results

# Function to create a zip file of shortlisted resumes
def create_zip_of_resumes(output_folder, zip_filename='shortlisted_resumes.zip'):
    zip_file_path = os.path.join(output_folder, zip_filename)
    
    with zipfile.ZipFile(zip_file_path, 'w') as zipf:
        for foldername, subfolders, filenames in os.walk(output_folder):
            for filename in filenames:
                if filename != zip_filename:  
                    filepath = os.path.join(foldername, filename)
                    zipf.write(filepath, os.path.basename(filepath))
    
    return zip_file_path


if __name__ == '__main__':

    folder_path = '../resume_src'  
    output_folder = 'shortlisted_resumes'  
    job_role = "Data Scientist with expertise in machine learning and data analysis"

    n = 7
    batch_size = 500  
    shortlisted_resumes = process_large_scale_resumes(job_role, folder_path, output_folder, n=n, batch_size=batch_size)

    print(f"Top {n} resumes have been copied to the folder '{output_folder}':")
    for resume, similarity in shortlisted_resumes:
        print(f"{resume} (Similarity: {similarity:.2f})")

    zip_file = create_zip_of_resumes(output_folder)
    print(f"Shortlisted resumes have been zipped into: {zip_file}")


