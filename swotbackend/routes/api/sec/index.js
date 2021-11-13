const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
const {v4 : uuidv4} = require ('uuid');
const {WriteConcernError} = require("mongodb");
const mailSender = require("../../../utils/mailer");
let SecModelClass = require('./sec.model.js');
let SecModel = new SecModelClass();

router.post('/login', async(req, res, next)=>{
    try{
        const {email, pswd} = req.body;
        //Validar los datos
        let userLogged = await SecModel.getByEmail(email);
        if(userLogged){
            const isPswdOk = await SecModel.comparePassword(pswd, userLogged.password);
            if(isPswdOk){
                //podemos validar la vigencia de la contraseña
                delete userLogged.password;
                delete userLogged.oldpasswords;
                delete userLogged.lastlogin;
                delete userLogged.lastpasswordchange;
                delete userLogged.passwordexpires;
                
                let payload = {
                    jwt : jwt.sign(
                    {
                        email: userLogged.email, 
                        _id: userLogged._id, 
                        roles: userLogged.roles
                    },
                    process.env.JWT_SECRET,
                    {expiresIn: '1d'}
                    ),
                    user:userLogged
                };
                return res.status(200).json(payload);
            }
        }
        console.log({email,userLogged});
        return res.status(400).json({"msg": "Credenciales no Válidas"});
    }catch(ex){
        res.status(500).json({"msg": "Error"});
    }
});

router.post('/signin', async (req, res, next) => {
    try {
      const {email, pswd} = req.body;
      let userAdded = await SecModel.createNewUser(email, pswd);
      delete userAdded.password;
      console.log(userAdded);
      res.status(200).json({"msg":"Usuario Creado Satisfactoriamente"});
    } catch (ex) {
      res.status(500).json({ "msg": "Error" });
    }
  });

  /*router.get('/passrecovery', async (req, res, next)=>{
    mailSender(
      "mcsflores20@gmail.com",
      "Test de Envio de Correo",
      '<h1>Esto es un prueba de correo</h1><p>Click aqui para setear contraseña <a href="http://localhost:3000/recovery">CLICK ME</></p>'
    );
    res.status(200).json({msg:"Email Sent!!!"});
  });*/

  router.get('/passrecoveryemail', async (req, res, next)=>{
    try {
      const {email} = req.body;
      //1. Verificar que el correo este registrado
      let userLogged = await SecModel.getByEmail(email);
      if (userLogged) {
        const uuid=uuidv4();
        mailSender(
          email,
          "Restablecer contraseña",
          '<h1>Solicitud de restablecimiento de contraseña</h1><p>Hemos recibido una solicitud para restablecer su contraseña, si no ha sido usted ignore este correo.</p><h2>UUID: '+uuid+' (se muestra con fines ilustrativos)</h2><p><a style="background-color: #4CAF50;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;" href="http://localhost:3000/api/sec/passrecovery/{'+email+'}/{'+uuid+'}">RESTABLECER</></p>'
        );
        let settoken = await SecModel.setResetToken(email,uuid);
        res.status(200).json({"msg":"Correo de restablecimiento enviado"});
      }else{
        res.status(200).json({"msg":"Usuario no registrado"});
      }
    } catch (ex) {
      console.log(ex);
      res.status(500).json({ "msg": "Error" });
    }
  });
  
  router.get('/passrecovery/:email/:uuid', async (req, res, next)=>{
    try {
      const {email, uuid} = req.params;
      const {newpassword} = req.body;
      let validatetoken = await SecModel.validateToken(email,uuid);
      if (validatetoken) {
        let validatetoken = await SecModel.updatePassword(email,newpassword);
        let unsettoken = await SecModel.unsetResetToken(email);
        res.status(200).json({"msg":"Token válido, contraseña actualizada"});
      }else{
        let unsettoken = await SecModel.unsetResetToken(email);
        res.status(200).json({"msg":"Token inválido o ha expirado"});
      }
      
    } catch (ex) {
      console.log(ex);
      res.status(500).json({ "msg": "Error" });
    }
  });


module.exports = router;