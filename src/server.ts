import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  productRoutes,
  categoriesRoutes,
  ordersRoutes,
  rolesRoutes,
  usersRoutes,
  cartsRoutes,
  cartItemsRoutes,
  authRoutes,
} from "./routes";

const server = Fastify();
const prefix = "/api";

server.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
