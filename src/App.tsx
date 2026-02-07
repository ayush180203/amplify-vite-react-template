import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    const { user, signOut } = useAuthenticator();

  // Fetch & subscribe to todos (real-time)
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        setTodos([...items]);
      },
      error: (err) => {
        console.error("Subscription error:", err);
      },
    });

    // Cleanup to avoid memory leak
    return () => subscription.unsubscribe();
  }, []);

  // Create todo safely
  async function createTodo() {
    const content = window.prompt("Enter todo");
    if (!content || content.trim() === "") return;

    try {
      await client.models.Todo.create({
        content: content.trim(),
      });
    } catch (err) {
      console.error("Create error:", err);
    }
  }

  // Delete todo safely
  async function deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
       <h1>{user?.signInDetails?.loginId}'s todos</h1>

      <button onClick={createTodo}>➕ New Todo</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ marginTop: "8px" }}>
            {todo.content}
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => deleteTodo(todo.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      <p>🥳 App successfully hosted. Try creating a new todo.</p>

      <a
        href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
        target="_blank"
        rel="noreferrer"
      >
        Next Amplify steps
      </a>

      <br /><br />

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
