from cryptography.fernet import Fernet

#Encryption using cryptography and the Fernet library

SECRET_KEY = b'JxCY-CTWpRVOM6lr0Fxgci2SFPUsQqZRUkcvEsgKDFg='

f = Fernet(SECRET_KEY)

def encryptData(data):
    # Must encode the data first and then encrypt using Fernet
    return f.encrypt(data.encode())

def decryptData(encrypted_data):
    return f.decrypt(encrypted_data).decode()