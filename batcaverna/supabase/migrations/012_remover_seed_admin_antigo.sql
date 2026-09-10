-- Migração 012: Liberação da conta de administrador real
-- Remove o registro gerado pelo seed antigo que continha hash de senha em branco,
-- permitindo que o administrador cadastre sua própria senha segura pela interface.

DELETE FROM users 
WHERE email = 'raf4biel.venafro@gmail.com' 
  AND senha_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
