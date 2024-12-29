document.addEventListener('DOMContentLoaded', async () => {
  const productosDiv = document.getElementById('productos');
  const carrito = document.getElementById('carrito');
  const totalProductosSpan = document.getElementById('totalProductos');
  const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
  const comprarCarritoBtn = document.getElementById('comprarCarrito');

  // Cargar el carrito desde LocalStorage y SessionStorage al cargar la página
  cargarCarrito();

  // Consumir la API y mostrar productos
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const productos = await response.json();
    
    productos.forEach(producto => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product', 'col-md-4');

      const template = `
        <img src="${producto.image}" alt="Imagen del producto ${producto.title}"  width="100" height="100"  class="img-fluid">
        <h3>${producto.title}</h3>
        <p>$${producto.price}</p>
        <button class="btn btn-primary" data-id="${producto.id}">Añadir al Carrito</button>
      `;

      const templateContainer = document.createElement('div');
      templateContainer.innerHTML = template;

      while (templateContainer.firstChild) {
        productDiv.appendChild(templateContainer.firstChild);
      }

      productosDiv.appendChild(productDiv);
    });

    // Agregar eventos a los botones de "Añadir al Carrito"
    productosDiv.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const idProducto = e.target.getAttribute('data-id');
        const producto = productos.find(p => p.id == idProducto);
        agregarAlCarrito(producto);
      }
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }

  // Función para agregar productos al carrito
  function agregarAlCarrito(producto) {
    const nuevoProducto = document.createElement('li');
    nuevoProducto.innerHTML = `
      ${producto.title} - $${producto.price}
      <input type="number" value="1" min="1" class="cantidad">
      <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id}">Eliminar</button>
    `;
    nuevoProducto.classList.add('list-group-item');
    carrito.appendChild(nuevoProducto);
    actualizarTotalProductos();
    guardarCarrito();
  }

  // Evento para eliminar productos del carrito
  carrito.addEventListener('click', (e) => {
    if (e.target.classList.contains('eliminar')) {
      const productoEliminado = e.target.closest('li');
      carrito.removeChild(productoEliminado);
      actualizarTotalProductos();
      guardarCarrito();
    }
  });

  // Evento para cambiar la cantidad de productos en el carrito
  carrito.addEventListener('input', (e) => {
    if (e.target.classList.contains('cantidad')) {
      actualizarTotalProductos();
      guardarCarrito();
    }
  });

  // Función para actualizar el total de productos
  function actualizarTotalProductos() {
    let totalProductos = 0;
    carrito.querySelectorAll('li').forEach(producto => {
      const cantidad = producto.querySelector('.cantidad').value;
      totalProductos += parseInt(cantidad);
    });
    totalProductosSpan.textContent = totalProductos;
  }

  // Evento para vaciar el carrito
  vaciarCarritoBtn.addEventListener('click', () => {
    carrito.innerHTML = '';
    actualizarTotalProductos();
    guardarCarrito();
    alert('El carrito ha sido vaciado');
  });

  // Evento para comprar los productos del carrito
  comprarCarritoBtn.addEventListener('click', () => {
    if (carrito.querySelectorAll('li').length > 0) {
      alert('Compra realizada con éxito');
      carrito.innerHTML = '';
      actualizarTotalProductos();
      guardarCarrito();
    } else {
      alert('El carrito está vacío');
    }
  });

  // Función para guardar el carrito en LocalStorage y SessionStorage
  function guardarCarrito() {
    const productosEnCarrito = [];
    carrito.querySelectorAll('li').forEach(producto => {
      const id = producto.querySelector('button').getAttribute('data-id');
      const cantidad = producto.querySelector('.cantidad').value;
      productosEnCarrito.push({ id, cantidad });
    });
    
    // Guardar en localStorage y sessionStorage
    localStorage.setItem('carrito', JSON.stringify(productosEnCarrito));
    sessionStorage.setItem('carrito', JSON.stringify(productosEnCarrito));
  }

  // Función para cargar el carrito desde LocalStorage y SessionStorage
  function cargarCarrito() {
    let carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || JSON.parse(sessionStorage.getItem('carrito'));

    if (carritoGuardado) {
      carritoGuardado.forEach(item => {
        fetch(`https://fakestoreapi.com/products/${item.id}`)
          .then(response => response.json())
          .then(producto => {
            const nuevoProducto = document.createElement('li');
            nuevoProducto.innerHTML = `
              ${producto.title} - $${producto.price}
              <input type="number" value="${item.cantidad}" min="1" class="cantidad">
              <button class="btn btn-danger btn-sm eliminar" data-id="${producto.id}">Eliminar</button>
            `;
            nuevoProducto.classList.add('list-group-item');
            carrito.appendChild(nuevoProducto);
          });
      });
    }
  }
});
