import os
from typing import List, Optional

def read_text_file(file_path: str) -> Optional[str]:
    """
    Read content from a text file with encoding handling
    """
    try:
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    return file.read().strip()
            except UnicodeDecodeError:
                continue
        
        print(f"❌ Could not read file with any encoding: {file_path}")
        return None
        
    except Exception as e:
        print(f"❌ Error reading file {file_path}: {e}")
        return None

def read_questions_from_file(file_path: str) -> List[str]:
    """
    Read multiple questions from a text file
    """
    content = read_text_file(file_path)
    if not content:
        return []
    
    questions = [q.strip() for q in content.split('\n') if q.strip()]
    return questions

def ensure_directory(directory_path: str):
    """Create directory if it doesn't exist"""
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

def save_response_to_file(text: str, file_path: str):
    """Save text response to a file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"💾 Saved response to: {file_path}")
    except Exception as e:
        print(f"❌ Error saving response to file: {e}")