import { registerUser } from "@/actions/authActions"

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        action={registerUser}
        className="flex flex-col gap-4 w-[350px] border p-6 rounded"
      >
        <h1 className="text-2xl font-bold">Register</h1>

        <input
          name="name"
          placeholder="Name"
          className="border p-2"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2"
          required
        />

        <button className="bg-black text-white p-2">
          Register
        </button>
      </form>
    </div>
  )
}