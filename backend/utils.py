def serialize(n):
    return {
        'id': n['id'],
        'title': n['title'],
        'content': n['content'],
        'created_at': str(n['created_at']) if n['created_at'] else None,
        'updated_at': str(n['updated_at']) if n['updated_at'] else None,
    }
