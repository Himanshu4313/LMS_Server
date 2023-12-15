// access app file from app.js
import app from './app.js';
//This PORT come from .env file
const PORT = process.env.PORT || 3000;
//app is listen or server is running 
app.listen(PORT , () =>{
    console.log(`Server is runnig at http://localhost:${PORT}`);
});
