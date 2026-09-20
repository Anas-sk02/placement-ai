import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from worker.config import config

def _get_key() -> bytes:
    return hashlib.sha256(config.SESSION_ENCRYPTION_KEY.encode('utf-8')).digest()

def encrypt_session_string(plain_text: str) -> str:
    """Encrypts a Telethon session string using AES-256-GCM."""
    key = _get_key()
    aesgcm = AESGCM(key)
    import os
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, plain_text.encode('utf-8'), None)
    # IV (12 bytes) + Ciphertext (includes 16-byte auth tag at end)
    payload = iv + ciphertext
    return base64.b64encode(payload).decode('utf-8')

def decrypt_session_string(cipher_b64: str) -> str:
    """Decrypts a Telethon session string using AES-256-GCM."""
    key = _get_key()
    aesgcm = AESGCM(key)
    raw = base64.b64decode(cipher_b64.encode('utf-8'))
    iv = raw[:12]
    ciphertext = raw[12:]
    decrypted = aesgcm.decrypt(iv, ciphertext, None)
    return decrypted.decode('utf-8')
