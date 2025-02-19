import { useAccount, useCoState, useIsAuthenticated } from "jazz-react";
import { AuthButton } from "./AuthButton.tsx";
import { Form } from "./Form.tsx";
import { Logo } from "./Logo.tsx";
import { useEffect, useState } from "react";
import { ID } from "jazz-tools";
import { JazzAccount } from "./schema.ts";

function App() {
  const { me } = useAccount({ profile: {}, root: {} });
  const isAuthenticated = useIsAuthenticated();
  const [friendId, setFriendId] = useState<ID<JazzAccount>|''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [friend, setFriend] = useState<JazzAccount>();
  const [error, setError] = useState<Error>();
  const coStateFriend = useCoState(JazzAccount, friendId as ID<JazzAccount>, {profile: {} });

  const lookupFriend = async () => {
    if (!friendId) return;
    try {
      setFriend(undefined);
      setError(undefined);
      setIsLoading(true);
      const friend = await JazzAccount.load(friendId as ID<JazzAccount>, {profile: {} });
      await friend?._refs.profile?.load();
      console.log(friend?.profile?.firstName)
      setFriend(friend);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    lookupFriend();
  }, [friendId]);

  return (
    <>
      <header>
        <nav className="container flex justify-between items-center py-3">
          {isAuthenticated ? (
            <span>
              You're logged in as <strong>{me?.profile?.name}</strong>
            </span>
          ) : (
            <span>Authenticate to share the data with another device.</span>
          )}
          <AuthButton />
        </nav>
      </header>
      <main className="container mt-16 flex flex-col gap-8">
        <Logo />

        <div className="text-center">
          <h1>Welcome{me?.profile.name ? <>, {me?.profile.name}</> : ""}!</h1>
          <code onClick={() => navigator.clipboard.writeText(me?.id as string)}>{me?.id}</code>
          {!!me?.root.age && (
            <p>As of today, you are {me.root.age} years old.</p>
          )}
        </div>

        <Form />

        <div className="border border-gray-500 p-4 rounded-md">
          <div className="flex gap-2">
            <input
              className="border border-gray-500 p-2 rounded-md"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value as ID<JazzAccount>)}
              placeholder="Friend ID"
            />
          </div>
          {isLoading
            ? <p>Loading...</p>
            : (friendId && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 border border-gray-500 p-2 rounded-md">
                  <label className="text-sm font-bold">info from useCoState</label>
                  <div className="flex gap-2">
                  {coStateFriend ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <label>account:</label>
                        <p className="text-black">{JSON.stringify(coStateFriend?.toJSON(), null, 2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <label>profile:</label>
                        <p className="text-black">{JSON.stringify(coStateFriend?.profile?.toJSON(), null, 2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <label>profile name:</label>
                        <p className="text-black">{coStateFriend?.profile?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-black">no account</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 border border-gray-500 p-2 rounded-md">
                  <label className="text-sm font-bold">info from lookup function</label>
                  <div className="flex gap-2">
                  {friend ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <label>account:</label>
                        <p className="text-black">{JSON.stringify(friend?.toJSON(), null, 2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <label>profile</label>
                        <p className="text-black">{JSON.stringify(friend?.profile?.toJSON(), null, 2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <label>profile name</label>
                        <p className="text-black">{friend?.profile?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-black">no account</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label>error</label>
                    {error && <p className="text-black">{error.message || "no error"}</p>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </>
  );
}

export default App;
