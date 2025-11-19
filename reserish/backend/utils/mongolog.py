# backend/utils.py
import traceback, json
from django.conf import settings
from pymongo import MongoClient, ASCENDING
from datetime import datetime
from django.http import JsonResponse
import time 

# initialize a global Mongo client
_mongo_client = MongoClient(settings.MONGO_URI)
_mongo_db     = _mongo_client[settings.MONGO_DB]
_error_coll   = _mongo_db["error_logs"]

def ensure_mongo_indexes():
    """Create TTL and view_name indexes if they don't exist."""
    # 30 days TTL on timestamp
    _error_coll.create_index(
        [("timestamp", ASCENDING)],
        expireAfterSeconds=60 * 60 * 24 * 30,
        background=True,
    )
    # index on view_name for faster lookups
    _error_coll.create_index(
        [("view_name", ASCENDING)],
        background=True,
    )

def log_error(view_name, error, request=None):
    """Insert an error log document into Mongo."""
    # make sure indexes are in place
    if not settings.USE_MONGO:
        print("MongoDB logging is disabled.")
        print(error,view_name)
        return
    ensure_mongo_indexes()
    print(time.time(),time.ctime(),time.localtime(),datetime.utcnow())

    doc = {
        "timestamp"    : datetime.utcnow(),
        "view_name"    : view_name,
        "error_message": str(error),
        "stack_trace"  : traceback.format_exc(),
    }
    if request:
        try:
            body=None
            try:
                body  = json.dumps(request.data)[:500]  # bytes
            except Exception as e:
                print(e)
                doc["request_body_parse_error"] = True

            # Attempt to parse POST data (if form-encoded, this might still work)
            post_data = {}
            try:
                post_data = request.POST.dict()
            except Exception:
                post_data = {"error": "Unable to parse POST data"}

            doc["user"] = str(request.user)
            doc["request"] = {
                "method": request.method,
                "path": request.get_full_path(),
                "GET": request.GET.dict(),
                "POST": post_data,
                "body": body,
            }
        except Exception as e:
            print(e)
            doc["request_parse_error"] = True

    _error_coll.insert_one(doc)

def get_logs_mongo(request):
    client = _mongo_client
    db = _mongo_db  
    logs_collection = _mongo_db["error_logs"]

    start_time = request.GET.get("start_time")
    end_time = request.GET.get("end_time")
    limit = int(request.GET.get("limit", 20))
    skip = int(request.GET.get("skip", 0))

    query = {}

    if start_time:
        start_dt = datetime.fromisoformat(start_time)
        query["timestamp"] = {"$gte": start_dt}

    if end_time:
        end_dt = datetime.fromisoformat(end_time)
        query.setdefault("timestamp", {})
        query["timestamp"]["$lte"] = end_dt

    cursor = logs_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = []
    for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
    return JsonResponse({"logs": logs})