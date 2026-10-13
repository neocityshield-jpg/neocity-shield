const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authController = {

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const passwordValido = await Usuario.verificarPassword(password, usuario.password);
      if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

    async registro(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      const ROLES = ['funcionario', 'sgsst', 'gerencia'];

      if (typeof nombre !== 'string' || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      if (typeof email !== 'string' || !email.trim().toLowerCase().endsWith('@evidenciadigital.com')) {
        return res.status(400).json({ error: 'Solo se permiten correos @evidenciadigital.com' });
      }
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }
      if (!ROLES.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const usuario = await Usuario.crear({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol
      });
      res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  },

  async perfil(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};

module.exports = authController;
