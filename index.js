const express=require("express"); //crea rutas mas facil
const cors=require("cors");//permite seguridad de las rutas
const mongoose=require("mongoose");// utiliza para las base de datos no relacional con mongo
require("dotenv").config();//permite manejas variables de entorno

const app = express();
app.use(express.json());
app.use(cors());

const mongoDir=process.env.MONGODB_DIR;

try{
    mongoose.connect(mongoDir);
    console.log("conectado a mongoDB");
}   catch(error){
    console.error("error de conexion", error)
   }

const libroSchema=new mongoose.Schema({
   titulo:String,
   autor:String, 
})
const Libro=mongoose.model("Libro",libroSchema);

app.use((req,res,next)=>{
  const authToken=req.headers["authorization"];

  if(authToken==="miTokenSecreto123"){
    next();
  }else{
    res.status(401).send("acceso no autorizado");
  }
});

// ruta crear libro
app.post("/libros",async(req, res)=>{
  const libro=new Libro({
    titulo:req.body.titulo,
    autor:req.body.autor
  })

  try{
    await libro.save();
    res.json(libro);
  } catch(error){
    res.status(500).send("Error al guardar libro",error);
  }
})

//ruta pedir listado de libros desde la base de datos
 app.get("/libros",async (req, res) => {
  try{
    const libros=await Libro.find();
    res.json(libros);
  }catch (error){
    res.status(500).send("Errorn al obtener libros",error)
  } 
  });

    // ruta actualizar libro
    app.put("/libros/:id", async (req, res) => {
      try {
        let id = req.params.id;
        const libro = await Libro.findByIdAndUpdate(id,{ titulo: req.body.titulo, autor: req.body.autor },
        { new: true }
    );
          if (libro) {
          res.json(libro);
        } else {
        res.status(404).send("Libro no encontrado");
      }
      } catch (error) {
        res.status(500).send("Error al actualizar el libro", error);
      }
    });

   //ruta eliminar libro
   app.delete("/libros/:id", async (req, res) => {
    try {
      let id = req.params.id;
      const libro = await Libro.findByIdAndDelete(id);
      if (libro) {
        res.status(204).send("libro eliminado");
      } else {
       res.status(404).send("Libro no encontrado");
      }
    } catch (error) {
      res.status(500).send("Error al eliminar el libro",error);
    }
  });


    //ruta consultar libro por id
    app.get("/libros/:id", async (req, res) => {
      try {
        const libro = await Libro.findById(req.params.id);
        if (libro) {
          res.json(libro);
        } else {
          res.status(404).json({mensaje:'Libro no encontrado'});
        }
      } catch (error) {
        res.status(500).send("Error al consultar el libro", error);
      }
    });

   // iniciar el servidor
   app.listen(3000, () => {
   console.log("Servidor ejecutandose en http://localhost:3000/");
  });