import {verifyInvitation,setInitialPassword} from './fleet-api.js';
const params=new URLSearchParams(location.hash.slice(1));
let invitation=params.get('invite');
// Invitation credentials stay out of server logs, storage and browsing history.
if(invitation!==null){
 history.replaceState(null,'',location.pathname+location.search);
 const login=document.querySelector('#loginSection');
 const section=document.querySelector('#invitationSection');
 const feedback=document.querySelector('#invitationFeedback');
 const activate=document.querySelector('#acceptInvitation');
 const form=document.querySelector('#initialPasswordForm');
 login.hidden=true;section.hidden=false;
 if(!/^[a-zA-Z0-9_-]{32,256}$/.test(invitation)){
  feedback.textContent='Este enlace no es válido. Solicita una nueva invitación.';activate.hidden=true;invitation=null;
 }
 activate.addEventListener('click',async()=>{
  activate.disabled=true;feedback.textContent='Verificando tu invitación…';
  try{
   const user=await verifyInvitation(invitation);invitation=null;
   document.querySelector('#invitationAccount').textContent=user.email;
   activate.hidden=true;form.hidden=false;feedback.textContent='Elige una contraseña para tu cuenta.';
   form.elements.password.focus();
  }catch{
   feedback.textContent='La invitación no es válida, ha caducado o todavía no tiene permisos. Solicita una nueva invitación.';
   activate.disabled=false;
  }
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  if(form.elements.password.value!==form.elements.confirmPassword.value){feedback.textContent='Las contraseñas no coinciden.';return;}
  const button=form.querySelector('button');button.disabled=true;feedback.textContent='Guardando tu contraseña…';
  try{
   await setInitialPassword(form.elements.password.value);form.reset();section.hidden=true;login.hidden=false;
   document.querySelector('#loginFeedback').textContent='Tu cuenta está activada. Ya puedes entrar con tu correo y contraseña.';
   document.querySelector('#loginForm').elements.email.value=document.querySelector('#invitationAccount').textContent;
   document.querySelector('#loginForm').elements.password.focus();
  }catch(error){feedback.textContent=error.message;}finally{button.disabled=false;}
 });
}
