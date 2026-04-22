import mysql.connector
import os
from dotenv import load_dotenv

"""
MySQL 데이터베이스 연동 및 쿼리 관리를 위한 모듈입니다.
"""

load_dotenv()

def getConnection():
    """ 
    데이터베이스 연결 객체를 생성하여 반환합니다.
    """
    try:
        dbConfig = {
            "host": os.getenv("DB_HOST"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "database": os.getenv("DB_NAME")
        }
        connection = mysql.connector.connect(**dbConfig)
        return connection
    except Exception as e:
        print(f"연결 실패: {e}")
        return None

def executeQuery(query, params=None):
    """
    SQL 쿼리를 실행하고 결과를 반환합니다.
    """
    try:
        dbConnection = getConnection()
        if dbConnection is None:
            return {"success": False, "message": "데이터베이스 연결에 실패했습니다."}
        
        cursor = dbConnection.cursor(dictionary=True)
        cursor.execute(query, params)
        
        if query.strip().upper().startswith("SELECT"):
            result = cursor.fetchall()
        else:
            dbConnection.commit()
            result = cursor.rowcount
            
        cursor.close()
        dbConnection.close()
        
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "message": str(e)}
