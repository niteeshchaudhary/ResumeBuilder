from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import subprocess
import os
from pydantic import BaseModel

class CompileRequest(BaseModel):
    output_dir: str
    user_folder: str
    random_num: str
    abs_path: str

app = FastAPI()

@app.post("/compile/")
async def compile_latex(data: CompileRequest):
    print(data)
    user_folder = data.user_folder
    output_dir = f"shared/temp_latex/{user_folder}"
    random_num = data.random_num
    abs_path= f"shared/temp_latex/{user_folder}/temp{random_num}.tex"
    print(output_dir, user_folder, random_num, abs_path)
# file: UploadFile = File(...)
    try:
        log_path = os.path.join(output_dir, 'output.log')
        with open(log_path, 'w') as log_file:
            subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', '-output-directory', output_dir, abs_path],
                check=True,
                stdout=log_file,
                stderr=log_file
            )
    except subprocess.CalledProcessError:
        pdf_url = f'media/temp_latex/{user_folder}/temp{random_num}.pdf'
        return JSONResponse({'pdf_url': pdf_url})
    
    return JSONResponse({'pdf_url': pdf_url})
        # return JsonResponse({'pdf_url': pdf_url})
        # return Response({'error': 'Compilation failed'}, status=status.HTTP_400_BAD_REQUEST)

    # filename = file.filename
    # with open(filename, "wb") as f:
    #     f.write(await file.read())
    
    # try:
    #     result = subprocess.run(
    #         ['pdflatex', '-interaction=nonstopmode', filename],
    #         capture_output=True,
    #         check=True
    #     )
    #     pdf_name = filename.replace('.tex', '.pdf')
    #     if os.path.exists(pdf_name):
    #         with open(pdf_name, "rb") as pdf_file:
    #             return Response(content=pdf_file.read(), media_type="application/pdf")
    #     else:
    #         return {"error": "PDF not generated"}
    # except subprocess.CalledProcessError as e:
    #     return {"error": e.stderr.decode()}
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)