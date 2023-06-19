const h1 = document.querySelector('#h1');
const titulo = "La Librería";
h1.innerText = titulo;


const leerProductosBBDD = async () =>
    {
        const resultado = await fetch('../productos.json');
        const productos = await resultado.json();
        localStorage.setItem('productos', JSON.stringify(productos));
    }

const productos = JSON.parse(localStorage.getItem("productos")) || [];

//Leo del localStorage, si existe carrito allí entonces mediante JSON convierto lo que existe en un objeto y lo almaceno en la constante carrito, si lo anterior es NULL entonces creo un array vacio.
const carrito = JSON.parse(localStorage.getItem("carrito")) ?? [];

//Desestructuración de las variables del objeto del array Productos.
//Utilización de alias para renombrar la variable cantidad_disponible como stock.

const verProducto = ({id, nombre, descripcion, precio, cantidad_disponible: stock, imagen}) => 
    {
        const tabla = document.querySelector("#tabla");
        const tr = document.createElement("tr");
        tr.id = `${id}`;
        tr.innerHTML =  
                        `
                        <td><img class="imgTabla" src="${imagen}" alt="Imagen del artículo"></td>
                        <td>${id}</td>
                        <td>${nombre}</td>
                        <td>$ ${precio}.-</td>
                        <td>${stock}</td>
                        <td>
                            <form id="modifica${id}">
                                <textarea class="color" rows="3" name="descripcion">${descripcion}</textarea>
                                <input class="boton" type="submit" value="Modificar">
                            </form>
                        </td>
                        <td>    
                           <form id="elimina${id}">
                                <input class="boton" type="submit" value="Eliminar">
                            </form>
                        </td>
                        `; 
        tabla.append(tr);
        eliminarProductoTabla(id);
        modificarDescripcion(id);
    }

//Si modifico el campo descripción de un producto, tal actualización la veo en el console.log solamente.
const modificarDescripcion = (id) => 
    {
        const modificarRegistro = document.getElementById("modifica" + id);
        modificarRegistro.addEventListener("submit", (e) =>
            {
                e.preventDefault();
                dato = e.target.children["descripcion"].value;
                productos[id-1].descripcion = dato; 
                console.log(productos[id-1].descripcion);
            })
    }

/*
Cuando elimino un producto de la tabla, tal eliminación también se refleja en la tarjeta correspondiente
si es que el stock del producto es mayor a 0.
*/
const eliminarProductoTabla = (id) =>
    {
        const eliminarRegistro = document.querySelector("#elimina" + id);
        const tarjeta = document.getElementById(id);
        eliminarRegistro.addEventListener("submit",(e) => 
            {
                e.preventDefault();
                document.getElementById(id).remove();
                if(productos[id-1].cantidad_disponible != 0)
                    {
                       document.getElementById(tarjeta.id).remove();        
                    }         
            })
    }

const verTarjeta = ({id, nombre_del_producto: nombre, descripcion, precio, cantidad_disponible: stock, imagen}) =>
    {
                const divTarjetasMain = document.querySelector("#divTarjetasMain");
                const tarjeta = document.createElement("div");
                tarjeta.className = "tarjetaProducto";
                tarjeta.id = `${id}`;
                // Alt + 96 comilla simple invertida
                tarjeta.innerHTML = 
                                    `
                                    <img src="${imagen}" alt="Imagen del artículo">
                                    <h3>${nombre}</h3>
                                    <textarea id="descripcionTarjeta" rows="2" readonly>${descripcion}</textarea>
                                    <span>$ ${precio}.-</span>
                                    <form id="formularioCarrito${id}">
                                    <input name="id" type="hidden" value="${id}">
                                    <label>Cantidad</label>
                                    <input name="cantidad" type="number" value="1" min='1' max="${stock}">
                                    <input type="submit" class="boton" value="Agregar al carrito">
                                    </form>
                                    `;
                divTarjetasMain.append(tarjeta);
    }

const calcularTotal = () =>
    {
        const resultado = carrito.reduce((acc, carrito) => acc + carrito.subtotal, 0);
        return resultado;
    }

const venta = (id, nombre, cantidad, precio, subtotal, dia) =>
    {
        const ventaTabla = document.querySelector("#ventaTabla");
        const total = document.getElementById("total");
        const tr = document.createElement("tr");
        tr.id = `${id}`;
        tr.innerHTML =  
                        `
                        <td>${id}</td>
                        <td>${nombre}</td>
                        <td>${cantidad}.-</td>
                        <td>$ ${precio}</td>
                        <td>$ ${subtotal}</td>
                        <td>${dia}</td>
                        `; 
        ventaTabla.append(tr);
        const resultado = calcularTotal();
        total.innerHTML = resultado;     
    }

const agregarCarrito = (id, nombre, precio) =>
    {
        const formularioCarrito = document.querySelector("#formularioCarrito" + id);
        formularioCarrito.addEventListener("submit",(e)=>
        {
            e.preventDefault();
            const cantidad = e.target.children['cantidad'].value;
            const subtotal = cantidad * precio;
            const fecha = new Date();
            const dia = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
            console.log(nombre);
            carrito.push
                ({
                    id,
                    nombre,
                    cantidad,
                    precio,
                    subtotal,
                    dia,
                })
            localStorage.setItem("carrito",JSON.stringify(carrito));
            console.log(carrito);
            venta(id, descripcion, cantidad, precio, subtotal, dia);
            Toastify
                ({
                    text: "Artículo agregado.",
                    className: "info",
                    duration: 2000,
                    gravity: 'top',
                    position: 'center',                        
                    style:
                        {
                            background: "rgb(55, 55, 107)",
                        }
                    }).showToast();
        })
    }

const verProductos = () =>
    {
        productos.forEach(producto =>
            {
                verProducto(producto);
                if(producto.cantidad_disponible != 0)
                    {
                        verTarjeta(producto);
                        agregarCarrito(producto.id, producto.nombre, producto.precio);
                    }
            })
    }

/*
Se puede ingresar un porcentaje para actualizar el precio de todos los productos, cargando el mismo porcentaje. Solo se muestra vía
console.log, no se actualiza en la tabla ni tampoco en la tarjeta.
*/
const actualizarPrecio = () =>
    {
        const actualizarPrecio = document.querySelector("#actualizarPrecio");
        actualizarPrecio.addEventListener("submit",(e) =>
        {
                e.preventDefault();
                const incremento = e.target.children[0].value;
                productos.forEach(producto =>
                    {
                        console.log("El producto " + producto.nombre_del_producto + " cuyo precio actual es $ " + producto.precio);
                        producto.precio = producto.precio + ( producto.precio * (incremento / 100));
                        console.log("Con el incremento del " + incremento + " % vale $ " + producto.precio);
                    })
                actualizarPrecio.reset();
        })
    }

const footer = document.querySelector("#footer");
const y = new Date();
const anio = y.getFullYear();
footer.innerHTML = "Copyright " + anio + ' ' + titulo.toUpperCase() + " | Todos los derechos reservados."

verProductos();
leerProductosBBDD();
actualizarPrecio();