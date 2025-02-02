import Fastify from "fastify";
import productRoutes from "./routes/productRoutes";
import cartItemsRoutes from "./routes/cartItemsRoutes";
import cartsRoutes from "./routes/cartsRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import ordersRoutes from "./routes/ordersRoutres";
import rolesRoutes from "./routes/rolesRoutes";
import usersRoutes from "./routes/usersRoutes";

const server = Fastify();
// {logger: true}

const prefix = "/api";

server.register(productRoutes, { prefix: prefix + "/products" });
server.register(cartItemsRoutes, { prefix: prefix + "/cart-items" });
server.register(cartsRoutes, { prefix: prefix + "/carts" });
server.register(categoriesRoutes, { prefix: prefix + "/categories" });
server.register(ordersRoutes, { prefix: prefix + "/orders" });
server.register(productRoutes, { prefix: prefix + "/products" });
server.register(rolesRoutes, { prefix: prefix + "/roles" });
server.register(usersRoutes, { prefix: prefix + "/users" });

const start = async () => {
  try {
    // Set host to 0.0.0.0 and port to process.env.PORT or 3000
    await server.listen({
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 3000,
    });
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
  } catch (err) {
    server.log.error(err);
  }
};

start();
