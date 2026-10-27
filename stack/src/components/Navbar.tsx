import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  Logout();
  router.push("/login");
};

  return (
    <header className="top-0 z-50 flex min-h-13.25 w-full items-center justify-center border-t-[3px] border-[#ef8236] bg-white shadow-[0_1px_5px_#00000033]">
      <div className="mx-auto flex w-[90%] max-w-360 items-center justify-between py-1">
        {/* Mobile sidebar button */}
        <Button
          type="button"
          aria-label="Toggle sidebar"
          className="rounded p-2 transition hover:bg-gray-100 sm:block md:hidden"
          onClick={handleslidein}
        >
          <Menu className="h-5 w-5 text-gray-800" />
        </Button>

        {/* Logo, navigation and search */}
        <div className="flex grow items-center gap-2">
          <Link href="/" className="px-3 py-1">
            <img
              src="/logo.png"
              alt="CodeQuest Logo"
              className="h-6 w-auto"
            />
          </Link>

          <nav className="hidden gap-1 sm:flex">
            {["About", "Products", "For Teams"].map((item) => (
              <Link
                key={item}
                href="/"
                className="rounded px-4 py-2 text-sm font-medium text-[#454545] transition hover:bg-gray-200"
              >
                {item}
              </Link>
            ))}
          </nav>

          <form
            className="relative hidden flex-grow:1 px-3 lg:block"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search questions"
              className="w-full max-w-150 rounded border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>

        {/* Authentication buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={`/users/${user._id}`}
                aria-label="Your profile"
                title={user.name || "Your profile"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white"
              >
                {String(user.name || "U").charAt(0).toUpperCase()}
              </Link>

              <Button
                type="button"
                onClick={handleLogout}
                className="rounded border border-blue-500 bg-[#e7f8fe] px-4 py-1.5 text-sm font-medium text-[#454545] transition hover:bg-[#d3e4eb]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded px-3 py-2 text-sm font-medium text-[#454545] hover:bg-gray-100"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
