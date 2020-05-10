module.exports = {
    mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
    sandbox: process.env.NODE_ENV === 'production' ? false : true,
    sandbox_email: process.env.NODE_ENV === 'production' ? null : 'c32212139028096145154@sandbox.pagseguro.com.br',
    email: "robsonptrainer@gmail.com",
    token: "E927EB3752184C859B2AB72E72FA456D",
    notificationURL: 'http://localhost:3000/v1/api/pagamentos/notificacao'

}