from setuptools import setup, find_packages

setup(
    name="vega-api",
    packages=find_packages(),
)
```

Sonra Render **Settings** → **Build Command** şununla değiştir:
```
pip install uvicorn fastapi python-dotenv h3 shapely psycopg2-binary httpx pydantic pydantic-settings websockets pyjwt python-multipart supabase==2.28.2 yarl numpy && pip install -e .
