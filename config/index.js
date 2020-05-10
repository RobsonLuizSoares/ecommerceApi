module.exports = {
    secret: process.env.NODE_ENV === "production" ? process.env.NODE_ENV : "robsonamaalya",
    api: process.env.NODE_ENV === "production" ? "https://" : "http://localhost:3000",
    loja: process.env.NODE_ENV === "production" ? "https://" : "http://localhost:8000"
}