import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials missing", credentials);
          return null;
        }

        try {
          console.log("Attempting authentication with:", {
            username: credentials.email,
            password: "***" // Ne pas logger les mots de passe
          });
          
          // Appel à votre API FastAPI pour vérifier les identifiants
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-credentials`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.log("Authentication failed", response.status, errorData);
            return null;
          }

          const userData = await response.json();
          console.log("Authentication successful", userData);
          
          return {
            id: userData.id,
            name: userData.full_name || userData.username,
            email: userData.email || credentials.email,
            role: userData.role,
            apiToken: process.env.NEXT_PUBLIC_API_TOKEN,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
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
        token.apiToken = user.apiToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.apiToken = token.apiToken;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || "votre_secret_temporaire_pour_dev",
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };