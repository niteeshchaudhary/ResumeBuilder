# ResumeBuilder

Our original product

For running the project: 

Frontend:
- cd frontend
- npm install
- npm run dev
- frontend is discontinued here

Backend:
cd reserish
- pip install -r requirements.txt
- python manage.py makemigrations backend
- python manage.py migrate backend
- python manage.py collectstatic --noinput 
- python manage.py migrate
- python manage.py runserver


Containerised Run available now
- run in docker
- also in kubernets
- you need to create local image repository
- push the build images to local repository

Minikube scaling is also added
- with HA redis
- HA postgres

