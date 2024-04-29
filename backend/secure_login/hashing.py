import bcrypt

def hash_password(password):
    #bcrypt.hashpw = the actual hashing (takes string bytes and salt as arguments)
    #password.encode('utf-8') - converts the string to bytes with UTF-8 encoding
    #bcrypt.gensalt() - generates a random salt for each password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password.decode('utf-8')

def check_password(plain_password, hashed_password):
    # Turns both into bytes to check if they are the same
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
