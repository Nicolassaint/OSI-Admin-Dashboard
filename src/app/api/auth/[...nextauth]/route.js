import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

// Liste des utilisateurs en dur (dans un environnement de production, utilisez une base de données)
// Les mots de passe sont hachés avec bcrypt
const users = [
  {
    id: "1",
    name: "Admin OSI",
    email: "admin@osi.fr",
    password: "admin123", // Mot de passe en clair
    role: "admin",
  },
  {
    id: "2",
    name: "User OSI",
    email: "user@osi.fr",
    password: "user123", // Mot de passe en clair
    role: "user",
  },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials missing", credentials);
          return null;
        }

        const user = users.find((user) => user.email === credentials.email);

        if (!user) {
          console.log("User not found", credentials.email);
          return null;
        }

        console.log("Comparing passwords:", {
          provided: credentials.password,
          stored: user.password,
          match: credentials.password === user.password
        });

        // Comparaison directe des mots de passe (pour les tests uniquement)
        const isPasswordValid = credentials.password === user.password;

        if (isPasswordValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        console.log("Password invalid");
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || "votre_secret_temporaire_pour_dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 