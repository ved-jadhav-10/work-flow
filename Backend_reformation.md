# Backend Reformation

## Table of Contents
1. [Existing Backend Overview](#existing-backend-overview)
2. [Firebase Reformation Plan](#firebase-reformation-plan)
3. [Detailed Migration Steps](#detailed-migration-steps)
4. [Code Changes Required](#code-changes-required)

---

## Existing Backend Overview

### Architecture Summary
The current backend is a **FastAPI** application using **Supabase** for infrastructure and **Google Gemini/Groq** for AI capabilities.

### Technology Stack

#### Core Framework
- **FastAPI** (v0.115.0) - REST API framework
- **Uvicorn** - ASGI server
- **Python 3.x** runtime

#### Database & Storage
- **Supabase PostgreSQL** - Relational database with pgvector extension
- **SQLAlchemy** (v2.0.35) - ORM for database operations
- **Alembic** (v1.13.3) - Database migrations
- **pgvector** (v0.3.5) - Vector similarity search for embeddings
- **Supabase Storage** - File storage for uploaded documents

#### Authentication
- **JWT tokens** (python-jose) - Token-based authentication
- **bcrypt** - Password hashing
- Custom JWT middleware for request authentication
- Supports both credentials and OAuth providers

#### AI Services
- **Google Gemini** (gemini-2.0-flash) - Primary LLM provider
- **Groq** (llama-3.1-70b-versatile) - Fallback LLM provider
- **Ollama** (optional) - Local AI inference
- **Gemini text-embedding-004** - 768-dimensional embeddings for semantic search

#### File Processing
- **PyMuPDF (fitz)** - PDF text extraction
- **pdfplumber** - PDF table extraction
- **python-multipart** - File upload handling

### Database Schema

#### 1. **Users Table**
```sql
- id: UUID (Primary Key)
- name: TEXT
- email: TEXT (Unique, Indexed)
- hashed_password: TEXT (nullable for OAuth)
- provider: TEXT (credentials | google)
- avatar_url: TEXT
- created_at: TIMESTAMPTZ
```

#### 2. **Projects Table**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- name: TEXT
- goal: TEXT
- constraints: JSONB (array)
- decisions: JSONB (array)
- open_questions: JSONB (array)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 3. **Documents Table**
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- filename: TEXT
- file_url: TEXT (Supabase Storage path)
- doc_type: TEXT (pdf | text | md)
- raw_text: TEXT
- summary: TEXT (AI-generated)
- key_concepts: JSONB (array)
- implementation_steps: JSONB (array)
- created_at: TIMESTAMPTZ
```

#### 4. **Code Insights Table**
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- code_snippet: TEXT
- language: TEXT (python | javascript | etc)
- explanation: TEXT (AI-generated)
- components: JSONB (array)
- suggestions: JSONB (array)
- created_at: TIMESTAMPTZ
```

#### 5. **Tasks Table**
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- description: TEXT
- priority: TEXT (high | medium | low)
- status: TEXT (pending | done)
- source_text: TEXT
- created_at: TIMESTAMPTZ
```

#### 6. **Embeddings Table** (Uses pgvector)
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- source_type: TEXT (document | code | task)
- source_id: UUID
- content_chunk: TEXT
- embedding: vector(768) (pgvector type)
- created_at: TIMESTAMPTZ
```

#### 7. **Chat Messages Table**
```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id)
- role: TEXT (user | assistant)
- content: TEXT
- context_used: JSONB (array)
- created_at: TIMESTAMPTZ
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Create new user with credentials
- `POST /login` - Login with email/password
- `POST /oauth` - OAuth login (Google, GitHub)

#### Projects (`/api/projects`)
- `GET /` - List all user projects
- `POST /` - Create new project
- `GET /{id}` - Get project details
- `PUT /{id}` - Update project
- `DELETE /{id}` - Delete project

#### Learning Module (`/api/projects/{project_id}/documents`)
- `POST /upload` - Upload document (PDF/TXT/MD)
- `GET /` - List all documents in project
- `GET /{doc_id}` - Get document details
- `POST /{doc_id}/summarize` - Generate AI summary
- `POST /{doc_id}/concepts` - Extract key concepts
- `POST /{doc_id}/steps` - Generate implementation steps
- `DELETE /{doc_id}` - Delete document

#### Developer Module (`/api/projects/{project_id}/code`)
- `POST /explain` - Explain code snippet
- `POST /debug` - Debug code with suggestions
- `POST /readme` - Generate README from code
- `GET /insights` - List all code insights
- `DELETE /insights/{insight_id}` - Delete insight

### Key Features

#### 1. **Document Processing Pipeline**
- Upload → Extract text → Chunk text → Generate embeddings → Store in vector DB
- Supports PDF (with table extraction), TXT, and MD files
- 20 MB file size limit

#### 2. **AI-Powered Learning**
- Multiple summary levels (short, detailed, exam-ready)
- Automatic concept extraction with explanations
- Implementation step generation
- Semantic search across documents

#### 3. **Developer Productivity**
- Code explanation with components and patterns analysis
- Debugging assistance with context-aware suggestions
- Automatic README generation
- Multi-language support (Python, JavaScript, Java, etc.)

#### 4. **Vector Similarity Search**
- Uses pgvector extension for cosine similarity
- 768-dimensional Gemini embeddings
- Fast retrieval for RAG (Retrieval Augmented Generation)

#### 5. **Storage Architecture**
- Structured data → Supabase PostgreSQL
- File storage → Supabase Storage (private bucket)
- Signed URLs for secure time-limited file access

### Supabase-Specific Dependencies

#### 1. **Database Connection**
- Direct PostgreSQL connection via SQLAlchemy
- Connection string format: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`
- Uses connection pooling (size=5, max_overflow=10)

#### 2. **File Storage**
- Supabase Storage Python SDK (`supabase` package)
- Private bucket named "documents"
- Signed URLs with 1-hour expiry
- Organized by project: `documents/{project_id}/{uuid}_{filename}`

#### 3. **pgvector Extension**
- Must be enabled in Supabase Dashboard
- Provides `vector(768)` data type
- Supports cosine distance operator `<=>`

#### 4. **Authentication**
- Custom JWT implementation (not using Supabase Auth)
- Frontend uses Supabase client for environment consistency

---

## Firebase Reformation Plan

### Why Migrate to Firebase?

1. **Unified Ecosystem** - All Google services under one umbrella
2. **Real-time Capabilities** - Built-in real-time database sync
3. **Better Scaling** - Automatic scaling without infrastructure management
4. **Cost Efficiency** - Free tier more generous for smaller projects
5. **Simplified Setup** - Fewer configuration steps

### Firebase Services Mapping

| Current (Supabase) | Firebase Equivalent | Migration Complexity |
|-------------------|-------------------|---------------------|
| PostgreSQL Database | Firestore | **High** - Schema restructure |
| Supabase Storage | Firebase Storage | **Low** - Similar API |
| pgvector | Vertex AI Matching Engine | **Medium** - Different approach |
| Custom JWT Auth | Firebase Authentication | **Medium** - API changes |
| Supabase Client SDK | Firebase Admin SDK | **Low** - Direct replacement |

### Architecture Changes

#### Current Flow
```
Client → FastAPI → Supabase PostgreSQL (via SQLAlchemy)
                 ↓
            Supabase Storage (file uploads)
                 ↓
            pgvector (embeddings)
```

#### New Flow
```
Client → FastAPI → Firestore (NoSQL document DB)
                 ↓
            Firebase Storage (file uploads)
                 ↓
            Firestore Vector Search (embeddings)
```

---

## Detailed Migration Steps

### Phase 1: Firebase Project Setup

#### Step 1.1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "workflow-ai-backend")
4. Enable Google Analytics (optional but recommended)
5. Select Analytics location and accept terms
6. Wait for project creation

#### Step 1.2: Enable Required Services
1. **Firestore Database**
   - Navigate to "Build" → "Firestore Database"
   - Click "Create database"
   - Choose location (e.g., `us-central1`)
   - Start in **Production mode** (we'll set rules later)
   - Wait for database provisioning

2. **Firebase Storage**
   - Navigate to "Build" → "Storage"
   - Click "Get Started"
   - Start in **Production mode**
   - Choose location (same as Firestore for consistency)

3. **Firebase Authentication**
   - Navigate to "Build" → "Authentication"
   - Click "Get Started"
   - Enable sign-in methods:
     - Email/Password → Enable
     - Google → Enable (configure OAuth consent screen)
     - GitHub → Enable (add GitHub OAuth app credentials)

4. **Firebase Extensions** (for vector search)
   - Navigate to "Build" → "Extensions"
   - Search for "Firestore Vector Search"
   - Or use Google Cloud Vertex AI Matching Engine

#### Step 1.3: Get Service Account Key
1. Navigate to Project Settings (gear icon) → "Service accounts"
2. Click "Generate new private key"
3. Download JSON file (e.g., `firebase-adminsdk.json`)
4. Store securely - **NEVER commit to git**

#### Step 1.4: Configure Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{projectId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Step 1.5: Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Documents subcollection
    match /projects/{projectId}/documents/{documentId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // Code insights subcollection
    match /projects/{projectId}/codeInsights/{insightId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // Tasks subcollection
    match /projects/{projectId}/tasks/{taskId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // Chat messages subcollection
    match /projects/{projectId}/chatMessages/{messageId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // Embeddings subcollection (write only by server)
    match /projects/{projectId}/embeddings/{embeddingId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

### Phase 2: Install Firebase Dependencies

#### Step 2.1: Update requirements.txt
```txt
# Remove Supabase dependencies
# supabase==2.7.4
# psycopg2-binary==2.9.10
# pgvector==0.3.5
# sqlalchemy==2.0.35
# alembic==1.13.3

# Add Firebase dependencies
firebase-admin==6.4.0
google-cloud-firestore==2.14.0
google-cloud-storage==2.14.0
```

#### Step 2.2: Install packages
```bash
cd server
pip install firebase-admin google-cloud-firestore google-cloud-storage
pip uninstall supabase sqlalchemy alembic psycopg2-binary pgvector
```

### Phase 3: Database Migration - Firestore Schema Design

#### Firestore Collection Structure

Firestore is a NoSQL document database, so we need to restructure from relational to document-based:

```
firestore/
├── users/                          (Collection)
│   └── {userId}/                   (Document)
│       ├── name: string
│       ├── email: string
│       ├── provider: string
│       ├── avatarUrl: string
│       └── createdAt: timestamp
│
├── projects/                       (Collection)
│   └── {projectId}/                (Document)
│       ├── userId: string
│       ├── name: string
│       ├── goal: string
│       ├── constraints: array
│       ├── decisions: array
│       ├── openQuestions: array
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       │
│       ├── documents/              (Subcollection)
│       │   └── {documentId}/       (Document)
│       │       ├── filename: string
│       │       ├── fileUrl: string
│       │       ├── docType: string
│       │       ├── rawText: string
│       │       ├── summary: string
│       │       ├── keyConcepts: array
│       │       ├── implementationSteps: array
│       │       └── createdAt: timestamp
│       │
│       ├── codeInsights/           (Subcollection)
│       │   └── {insightId}/        (Document)
│       │       ├── codeSnippet: string
│       │       ├── language: string
│       │       ├── explanation: string
│       │       ├── components: array
│       │       ├── suggestions: array
│       │       └── createdAt: timestamp
│       │
│       ├── tasks/                  (Subcollection)
│       │   └── {taskId}/           (Document)
│       │       ├── description: string
│       │       ├── priority: string
│       │       ├── status: string
│       │       ├── sourceText: string
│       │       └── createdAt: timestamp
│       │
│       ├── chatMessages/           (Subcollection)
│       │   └── {messageId}/        (Document)
│       │       ├── role: string
│       │       ├── content: string
│       │       ├── contextUsed: array
│       │       └── createdAt: timestamp
│       │
│       └── embeddings/             (Subcollection)
│           └── {embeddingId}/      (Document)
│               ├── sourceType: string
│               ├── sourceId: string
│               ├── contentChunk: string
│               ├── embedding: array (768 floats)
│               └── createdAt: timestamp
```

### Phase 4: Code Migration - File by File

#### Step 4.1: Update config.py

**Before (Supabase):**
```python
class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_db_url: str
    # ...
```

**After (Firebase):**
```python
class Settings(BaseSettings):
    firebase_credentials_path: str  # Path to service account JSON
    firebase_project_id: str
    firebase_storage_bucket: str
    # ...
```

#### Step 4.2: Create firebase.py (replaces database.py)

```python
"""Firebase initialization and helper functions."""

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import logging
from config import settings
from typing import Optional

logger = logging.getLogger(__name__)

_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.Client] = None
_bucket: Optional[storage.Bucket] = None


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _app, _db, _bucket
    
    if _app is not None:
        return
    
    try:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        _app = firebase_admin.initialize_app(cred, {
            'projectId': settings.firebase_project_id,
            'storageBucket': settings.firebase_storage_bucket,
        })
        
        _db = firestore.client()
        _bucket = storage.bucket()
        
        logger.info("✅ Connected to Firebase")
    except Exception as e:
        logger.error(f"❌ Firebase initialization failed: {e}")
        raise


def get_db() -> firestore.Client:
    """Get Firestore database client."""
    if _db is None:
        initialize_firebase()
    return _db


def get_storage() -> storage.Bucket:
    """Get Firebase Storage bucket."""
    if _bucket is None:
        initialize_firebase()
    return _bucket


def check_firebase_connection() -> bool:
    """Verify Firebase is reachable."""
    try:
        db = get_db()
        # Test connection by reading a document
        db.collection('_connection_test').limit(1).get()
        logger.info("✅ Firebase connection verified")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Firebase connection check failed: {e}")
        return False
```

#### Step 4.3: Update main.py

```python
from firebase import initialize_firebase, check_firebase_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup/shutdown logic."""
    logger.info("🚀 Workflow API starting up…")
    initialize_firebase()
    check_firebase_connection()
    yield
    logger.info("Workflow API shutting down.")
```

#### Step 4.4: Remove SQLAlchemy Models

Delete entire `models/` directory as Firestore doesn't use ORM models.

#### Step 4.5: Create firestore_models.py (optional type hints)

```python
"""Type hints for Firestore documents."""

from typing import TypedDict, List, Optional
from datetime import datetime


class UserDoc(TypedDict):
    name: str
    email: str
    provider: str
    avatarUrl: Optional[str]
    createdAt: datetime


class ProjectDoc(TypedDict):
    userId: str
    name: str
    goal: str
    constraints: List[str]
    decisions: List[str]
    openQuestions: List[str]
    createdAt: datetime
    updatedAt: datetime


class DocumentDoc(TypedDict):
    filename: str
    fileUrl: Optional[str]
    docType: str
    rawText: Optional[str]
    summary: Optional[str]
    keyConcepts: List[dict]
    implementationSteps: List[str]
    createdAt: datetime


class CodeInsightDoc(TypedDict):
    codeSnippet: str
    language: str
    explanation: Optional[str]
    components: List[dict]
    suggestions: List[dict]
    createdAt: datetime


class TaskDoc(TypedDict):
    description: str
    priority: str
    status: str
    sourceText: Optional[str]
    createdAt: datetime


class EmbeddingDoc(TypedDict):
    sourceType: str
    sourceId: str
    contentChunk: str
    embedding: List[float]
    createdAt: datetime


class ChatMessageDoc(TypedDict):
    role: str
    content: str
    contextUsed: List[dict]
    createdAt: datetime
```

#### Step 4.6: Update auth service (services/auth.py)

**Authentication Changes:**

```python
"""Authentication using Firebase Auth."""

from firebase_admin import auth
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


async def create_user(email: str, password: str, name: str) -> dict:
    """Create a new Firebase Auth user."""
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name,
        )
        return {
            'uid': user.uid,
            'email': user.email,
            'name': user.display_name,
        }
    except auth.EmailAlreadyExistsError:
        raise ValueError("Email already exists")
    except Exception as e:
        logger.error(f"User creation failed: {e}")
        raise


async def verify_password(email: str, password: str) -> dict:
    """Verify user credentials and return user data."""
    # Note: Firebase Admin SDK doesn't directly verify passwords
    # Frontend should use Firebase Auth SDK for login
    # Backend validates ID tokens instead
    try:
        user = auth.get_user_by_email(email)
        return {
            'uid': user.uid,
            'email': user.email,
            'name': user.display_name,
        }
    except auth.UserNotFoundError:
        raise ValueError("Invalid credentials")


def create_custom_token(uid: str) -> str:
    """Create a custom Firebase token."""
    return auth.create_custom_token(uid).decode('utf-8')


def verify_id_token(token: str) -> dict:
    """Verify Firebase ID token and return decoded claims."""
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise ValueError("Invalid token")
```

#### Step 4.7: Update auth middleware (middleware/auth.py)

```python
"""Firebase Auth middleware for FastAPI."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from firebase import get_db
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Verify Firebase ID token and return user data."""
    token = credentials.credentials
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Get user data from Firestore
        db = get_db()
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        user_data['id'] = uid
        
        return user_data
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
```

#### Step 4.8: Update auth router (routers/auth.py)

```python
"""Auth router using Firebase Authentication."""

from fastapi import APIRouter, Depends, HTTPException, status
from firebase_admin import auth as firebase_auth
from firebase import get_db
from schemas.auth import RegisterRequest, LoginRequest, UserResponse, AuthResponse
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """Register a new user with Firebase Auth."""
    db = get_db()
    
    try:
        # Create Firebase Auth user
        user = firebase_auth.create_user(
            email=body.email,
            password=body.password,
            display_name=body.name,
        )
        
        # Create user document in Firestore
        user_ref = db.collection('users').document(user.uid)
        user_data = {
            'name': body.name,
            'email': body.email,
            'provider': 'credentials',
            'avatarUrl': None,
            'createdAt': datetime.utcnow(),
        }
        user_ref.set(user_data)
        
        # Generate custom token for immediate login
        token = firebase_auth.create_custom_token(user.uid).decode('utf-8')
        
        return AuthResponse(
            user=UserResponse(
                id=user.uid,
                name=body.name,
                email=body.email,
                provider='credentials',
                avatar_url=None,
                created_at=datetime.utcnow(),
            ),
            access_token=token,
        )
        
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """Login endpoint - Frontend should use Firebase Auth SDK directly."""
    # Note: Firebase Admin SDK doesn't support password verification
    # Frontend should authenticate via Firebase Auth SDK
    # This endpoint is for compatibility only
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Use Firebase Auth SDK on frontend for login"
    )


@router.post("/oauth", response_model=AuthResponse)
async def oauth_login(token: str):
    """Verify OAuth token and create/update user in Firestore."""
    db = get_db()
    
    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded['uid']
        
        # Get Firebase Auth user info
        auth_user = firebase_auth.get_user(uid)
        
        # Create or update user in Firestore
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            user_data = {
                'name': auth_user.display_name or auth_user.email,
                'email': auth_user.email,
                'provider': auth_user.provider_data[0].provider_id if auth_user.provider_data else 'unknown',
                'avatarUrl': auth_user.photo_url,
                'createdAt': datetime.utcnow(),
            }
            user_ref.set(user_data)
        
        return AuthResponse(
            user=UserResponse(
                id=uid,
                name=auth_user.display_name,
                email=auth_user.email,
                provider=auth_user.provider_data[0].provider_id if auth_user.provider_data else 'unknown',
                avatar_url=auth_user.photo_url,
                created_at=datetime.utcnow(),
            ),
            access_token=token,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth authentication failed: {str(e)}"
        )
```

#### Step 4.9: Update projects router (routers/projects.py)

```python
"""Projects router using Firestore."""

from fastapi import APIRouter, Depends, HTTPException, status
from firebase import get_db
from datetime import datetime
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from middleware.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(body: ProjectCreate, current_user: dict = Depends(get_current_user)):
    """Create a new project."""
    db = get_db()
    
    project_ref = db.collection('projects').document()
    project_data = {
        'userId': current_user['id'],
        'name': body.name,
        'goal': body.goal,
        'constraints': body.constraints or [],
        'decisions': [],
        'openQuestions': [],
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow(),
    }
    project_ref.set(project_data)
    
    # Get counts (will be 0 for new project)
    project_data['id'] = project_ref.id
    project_data['document_count'] = 0
    project_data['task_count'] = 0
    project_data['insight_count'] = 0
    
    return ProjectResponse(**project_data)


@router.get("", response_model=ProjectListResponse)
async def list_projects(current_user: dict = Depends(get_current_user)):
    """List all projects for current user."""
    db = get_db()
    
    projects_ref = db.collection('projects').where('userId', '==', current_user['id'])
    projects = projects_ref.order_by('updatedAt', direction='DESCENDING').stream()
    
    project_list = []
    for project_doc in projects:
        project_data = project_doc.to_dict()
        project_data['id'] = project_doc.id
        
        # Get counts from subcollections
        doc_count = len(list(db.collection('projects').document(project_doc.id).collection('documents').stream()))
        task_count = len(list(db.collection('projects').document(project_doc.id).collection('tasks').stream()))
        insight_count = len(list(db.collection('projects').document(project_doc.id).collection('codeInsights').stream()))
        
        project_data['document_count'] = doc_count
        project_data['task_count'] = task_count
        project_data['insight_count'] = insight_count
        
        project_list.append(ProjectResponse(**project_data))
    
    return ProjectListResponse(projects=project_list)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get project details."""
    db = get_db()
    
    project_ref = db.collection('projects').document(project_id)
    project_doc = project_ref.get()
    
    if not project_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    project_data = project_doc.to_dict()
    
    # Verify ownership
    if project_data['userId'] != current_user['id']:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    project_data['id'] = project_id
    
    # Get counts
    doc_count = len(list(project_ref.collection('documents').stream()))
    task_count = len(list(project_ref.collection('tasks').stream()))
    insight_count = len(list(project_ref.collection('codeInsights').stream()))
    
    project_data['document_count'] = doc_count
    project_data['task_count'] = task_count
    project_data['insight_count'] = insight_count
    
    return ProjectResponse(**project_data)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, body: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    """Update project."""
    db = get_db()
    
    project_ref = db.collection('projects').document(project_id)
    project_doc = project_ref.get()
    
    if not project_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    project_data = project_doc.to_dict()
    if project_data['userId'] != current_user['id']:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    # Update fields
    update_data = body.dict(exclude_unset=True)
    update_data['updatedAt'] = datetime.utcnow()
    project_ref.update(update_data)
    
    # Return updated project
    return await get_project(project_id, current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Delete project and all subcollections."""
    db = get_db()
    
    project_ref = db.collection('projects').document(project_id)
    project_doc = project_ref.get()
    
    if not project_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    project_data = project_doc.to_dict()
    if project_data['userId'] != current_user['id']:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    # Delete all subcollections (documents, tasks, codeInsights, chatMessages, embeddings)
    # Note: Firestore doesn't cascade delete, must do manually
    for subcollection in ['documents', 'tasks', 'codeInsights', 'chatMessages', 'embeddings']:
        docs = project_ref.collection(subcollection).stream()
        for doc in docs:
            doc.reference.delete()
    
    # Delete project document
    project_ref.delete()
```

#### Step 4.10: Update file_storage service (services/file_storage.py)

```python
"""File storage using Firebase Storage."""

import logging
import uuid
from pathlib import PurePosixPath
from firebase import get_storage
from datetime import timedelta

logger = logging.getLogger(__name__)

SIGNED_URL_EXPIRY = timedelta(hours=1)


async def upload_file(file_bytes: bytes, filename: str, project_id: str) -> str:
    """Upload file to Firebase Storage."""
    bucket = get_storage()
    safe_name = PurePosixPath(filename).name
    storage_path = f"documents/{project_id}/{uuid.uuid4().hex[:8]}_{safe_name}"
    
    blob = bucket.blob(storage_path)
    blob.upload_from_string(
        file_bytes,
        content_type=_guess_content_type(filename)
    )
    
    logger.info(f"Uploaded {filename} → {storage_path}")
    return storage_path


async def get_signed_url(storage_path: str, expires_in: timedelta = SIGNED_URL_EXPIRY) -> str:
    """Generate signed URL for file access."""
    bucket = get_storage()
    blob = bucket.blob(storage_path)
    
    url = blob.generate_signed_url(
        expiration=expires_in,
        method='GET'
    )
    
    return url


async def delete_file(storage_path: str) -> None:
    """Delete file from Firebase Storage."""
    bucket = get_storage()
    blob = bucket.blob(storage_path)
    blob.delete()
    logger.info(f"Deleted {storage_path}")


def _guess_content_type(filename: str) -> str:
    ext = PurePosixPath(filename).suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".csv": "text/csv",
    }.get(ext, "application/octet-stream")
```

#### Step 4.11: Update embedding service (services/embedding_service.py)

```python
"""Embedding service using Firestore for vector storage."""

import logging
from firebase import get_db
from google import genai
from config import settings
from typing import List, Dict

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIM = 768

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


async def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text."""
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return list(response.embeddings[0].values)


async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts."""
    if not texts:
        return []
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
    )
    return [list(e.values) for e in response.embeddings]


async def similarity_search(
    project_id: str,
    query_embedding: List[float],
    top_k: int = 5
) -> List[Dict]:
    """
    Find similar embeddings using Firestore.
    
    Note: This is a simplified version. For production, use:
    1. Vertex AI Matching Engine (for large-scale vector search)
    2. Firestore Vector Search Extension
    3. External vector DB like Pinecone/Weaviate
    """
    db = get_db()
    
    # Get all embeddings for the project
    embeddings_ref = db.collection('projects').document(project_id).collection('embeddings')
    embeddings = embeddings_ref.stream()
    
    # Calculate cosine similarity for each
    results = []
    for emb_doc in embeddings:
        emb_data = emb_doc.to_dict()
        stored_embedding = emb_data['embedding']
        
        # Cosine similarity calculation
        distance = _cosine_distance(query_embedding, stored_embedding)
        
        results.append({
            'source_type': emb_data['sourceType'],
            'source_id': emb_data['sourceId'],
            'content_chunk': emb_data['contentChunk'],
            'distance': distance,
        })
    
    # Sort by distance and return top_k
    results.sort(key=lambda x: x['distance'])
    return results[:top_k]


def _cosine_distance(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine distance between two vectors."""
    import math
    
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))
    
    if magnitude1 == 0 or magnitude2 == 0:
        return 1.0
    
    cosine_similarity = dot_product / (magnitude1 * magnitude2)
    return 1 - cosine_similarity  # Convert similarity to distance
```

### Phase 5: Vector Search - Advanced Solutions

Since Firestore doesn't have native high-performance vector search like pgvector, you have three options:

#### Option 1: Vertex AI Matching Engine (Recommended for Production)

1. **Enable Vertex AI API**
   - Go to Google Cloud Console
   - Enable "Vertex AI API"
   - Enable "Vertex AI Feature Store API"

2. **Create Index**
   ```python
   from google.cloud import aiplatform
   
   aiplatform.init(project=settings.firebase_project_id, location="us-central1")
   
   index = aiplatform.MatchingEngineIndex.create_tree_ah_index(
       display_name="workflow-embeddings",
       dimensions=768,
       approximate_neighbors_count=10,
       distance_measure_type="COSINE_DISTANCE",
   )
   ```

3. **Deploy Index**
   ```python
   endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
       display_name="workflow-endpoint",
       public_endpoint_enabled=True,
   )
   
   endpoint.deploy_index(
       index=index,
       deployed_index_id="workflow_deployed",
   )
   ```

4. **Query Vectors**
   ```python
   response = endpoint.find_neighbors(
       deployed_index_id="workflow_deployed",
       queries=[query_embedding],
       num_neighbors=5,
   )
   ```

#### Option 2: Firestore Vector Search Extension (Easiest)

1. Install the "Firestore Vector Search" extension from Firebase Console
2. Configure collection and field paths
3. Automatically indexes and queries vectors

#### Option 3: External Vector Database (Most Flexible)

Use Pinecone, Weaviate, or Qdrant:

```python
# Example with Pinecone
import pinecone

pinecone.init(api_key=settings.pinecone_api_key)
index = pinecone.Index("workflow-embeddings")

# Store embedding
index.upsert(vectors=[
    (embedding_id, embedding_vector, {"project_id": project_id, "content": chunk})
])

# Search
results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={"project_id": project_id}
)
```

### Phase 6: Frontend Updates

#### Step 6.1: Install Firebase SDK
```bash
cd client
npm install firebase
npm uninstall @supabase/supabase-js
```

#### Step 6.2: Create firebase.ts (replaces supabase.ts)

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### Step 6.3: Update Authentication Flow

**Before (Supabase + NextAuth):**
```typescript
import { signIn } from "next-auth/react";
await signIn("credentials", { email, password });
```

**After (Firebase Auth):**
```typescript
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await getIdToken(userCredential.user);

// Send token to backend
await fetch(`${API_URL}/api/auth/oauth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token }),
});
```

### Phase 7: Environment Variables Update

#### Update .env file:

```bash
# Remove Supabase variables
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# SUPABASE_DB_URL=

# Add Firebase variables
FIREBASE_CREDENTIALS_PATH=./firebase-adminsdk.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Frontend Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Keep existing AI keys
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

### Phase 8: Data Migration Script

Create a migration script to transfer existing data from Supabase to Firebase:

```python
"""
migrate_supabase_to_firebase.py

Run this script to migrate all data from Supabase to Firebase.
"""

import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Supabase connection
SUPABASE_DB_URL = "your-supabase-connection-string"
engine = create_engine(SUPABASE_DB_URL)
SessionLocal = sessionmaker(bind=engine)

# Firebase connection
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


async def migrate_users():
    """Migrate users table."""
    session = SessionLocal()
    users = session.execute("SELECT * FROM users").fetchall()
    
    batch = db.batch()
    count = 0
    
    for user in users:
        user_ref = db.collection('users').document(str(user.id))
        user_data = {
            'name': user.name,
            'email': user.email,
            'provider': user.provider,
            'avatarUrl': user.avatar_url,
            'createdAt': user.created_at,
        }
        batch.set(user_ref, user_data)
        count += 1
        
        if count % 500 == 0:  # Firestore batch limit is 500
            batch.commit()
            batch = db.batch()
    
    batch.commit()
    session.close()
    print(f"✅ Migrated {count} users")


async def migrate_projects():
    """Migrate projects and all subcollections."""
    session = SessionLocal()
    projects = session.execute("SELECT * FROM projects").fetchall()
    
    for project in projects:
        project_ref = db.collection('projects').document(str(project.id))
        project_data = {
            'userId': str(project.user_id),
            'name': project.name,
            'goal': project.goal,
            'constraints': project.constraints or [],
            'decisions': project.decisions or [],
            'openQuestions': project.open_questions or [],
            'createdAt': project.created_at,
            'updatedAt': project.updated_at,
        }
        project_ref.set(project_data)
        
        # Migrate documents
        docs = session.execute(
            "SELECT * FROM documents WHERE project_id = %s",
            (str(project.id),)
        ).fetchall()
        
        for doc in docs:
            doc_ref = project_ref.collection('documents').document(str(doc.id))
            doc_data = {
                'filename': doc.filename,
                'fileUrl': doc.file_url,
                'docType': doc.doc_type,
                'rawText': doc.raw_text,
                'summary': doc.summary,
                'keyConcepts': doc.key_concepts or [],
                'implementationSteps': doc.implementation_steps or [],
                'createdAt': doc.created_at,
            }
            doc_ref.set(doc_data)
        
        # Migrate other subcollections (tasks, codeInsights, embeddings, etc.)
        # Similar process for each subcollection...
    
    session.close()
    print(f"✅ Migrated {len(projects)} projects")


async def main():
    """Run all migrations."""
    print("🚀 Starting migration from Supabase to Firebase...")
    await migrate_users()
    await migrate_projects()
    print("✅ Migration complete!")


if __name__ == "__main__":
    asyncio.run(main())
```

### Phase 9: Testing Checklist

- [ ] Firebase project created and configured
- [ ] All services enabled (Firestore, Storage, Authentication)
- [ ] Service account key downloaded and secured
- [ ] Python dependencies installed
- [ ] Frontend Firebase SDK installed
- [ ] All backend files updated
- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Data migration completed
- [ ] Authentication flow working
- [ ] File uploads working
- [ ] API endpoints responding correctly
- [ ] Vector search functioning (with chosen solution)
- [ ] Frontend connected to new backend

### Phase 10: Deployment Considerations

#### Production Optimizations

1. **Enable Firestore Indexes**
   - Create composite indexes for common queries
   - Example: `userId + updatedAt` for project listings

2. **Set Up Cloud Functions** (optional)
   - Trigger functions on document writes
   - Automatic backup scripts
   - Analytics tracking

3. **Configure Caching**
   - Use Firebase Hosting CDN for static files
   - Implement Redis for API response caching

4. **Monitoring & Logging**
   - Enable Firebase Performance Monitoring
   - Set up Cloud Logging
   - Configure error alerts

5. **Cost Management**
   - Set spending limits in Firebase Console
   - Monitor Firestore read/write operations
   - Optimize vector search queries

---

## Summary

### Key Differences: Supabase vs Firebase

| Aspect | Supabase | Firebase |
|--------|----------|----------|
| Database Type | Relational (PostgreSQL) | NoSQL (Document Store) |
| Vector Search | Native (pgvector) | External service needed |
| File Storage | Built-in, similar API | Built-in, similar API |
| Authentication | Custom JWT | Integrated Firebase Auth |
| Real-time | PostgreSQL triggers | Native real-time listeners |
| Query Language | SQL | Firestore queries |
| Scaling | Vertical scaling | Automatic horizontal scaling |
| Learning Curve | Lower (SQL familiar) | Moderate (NoSQL concepts) |

### Migration Complexity Score

- **Easy** (1-2 days): File storage, basic authentication
- **Medium** (3-5 days): API endpoints, Firestore schema design
- **Complex** (1-2 weeks): Vector search implementation, data migration, testing

### Recommended Timeline

1. **Week 1**: Firebase setup, dependencies, basic authentication
2. **Week 2**: Database migration, API endpoints, file storage
3. **Week 3**: Vector search implementation, data migration
4. **Week 4**: Frontend integration, testing, deployment

---

**End of Backend Reformation Guide**
