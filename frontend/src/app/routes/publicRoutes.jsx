import { lazy } from "react";
import { ROUTES } from "@/config/routes";

const loadHome = () => import("@/pages/index");
const loadServices = () => import("@/pages/Services");
const loadContact = () => import("@/pages/Contact");
const loadLoginPage = () => import("@/features/auth/LoginPage");
const loadSignupPage = () => import("@/features/auth/SignupPage");

const Home = lazy(loadHome);
const Services = lazy(loadServices);
const Contact = lazy(loadContact);
const LoginPage = lazy(loadLoginPage);
const SignupPage = lazy(loadSignupPage);

export const publicRoutes = [
  { path: ROUTES.home, component: Home },
  { path: ROUTES.services, component: Services },
  { path: ROUTES.contact, component: Contact },
  { path: ROUTES.login, component: LoginPage },
  { path: ROUTES.signup, component: SignupPage },
];

export function preloadGuestRouteChunks() {
  return Promise.allSettled([loadServices(), loadLoginPage(), loadSignupPage()]);
}

export function preloadCommonRouteChunks() {
  return Promise.allSettled([loadContact()]);
}
