import Fastify from "fastify";
import cors from "@fastify/cors";

import productRoutes from "./routes/productRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import ordersRoutes from "./routes/ordersRoutres";
import rolesRoutes from "./routes/rolesRoutes";
import usersRoutes from "./routes/usersRoutes";
import cartsRoutes from "./routes/cartsRoutes";
import cartItemsRoutes from "./routes/cartItemsRoutes";
import authRoutes from "./routes/authRoutes";

const server = Fastify();

const prefix = "/api";

// Register CORS middleware
server.register(cors, {
  origin: "*", // Allow all origins (not recommended in production)
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
});

server.register(authRoutes, { prefix: prefix + "/auth" });
server.register(productRoutes, { prefix: prefix + "/products" });
server.register(categoriesRoutes, { prefix: prefix + "/categories" });
server.register(ordersRoutes, { prefix: prefix + "/orders" });
server.register(rolesRoutes, { prefix: prefix + "/roles" });
server.register(usersRoutes, { prefix: prefix + "/users" });
server.register(cartsRoutes, { prefix: prefix + "/carts" });
server.register(cartItemsRoutes, { prefix: prefix + "/cartItems" });

const start = async () => {
  try {
    await server.listen({
      host: "0.0.0.0",
      port: (process.env.PORT || 3002) as number,
    });
    console.log(`Server listening on port ${process.env.PORT || 3002}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
