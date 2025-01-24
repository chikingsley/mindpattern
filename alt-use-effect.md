```markdown
# React v19 Documentation

## Learn React

### Escape Hatches

#### You Might Not Need an Effect

Effects are an escape hatch from the React paradigm. They let you “step outside” of React and synchronize your components with some external system like a non-React widget, network, or the browser DOM. If there is no external system involved (for example, if you want to update a component’s state when some props or state change), you shouldn’t need an Effect. Removing unnecessary Effects will make your code easier to follow, faster to run, and less error-prone.

**You will learn:**
- Why and how to remove unnecessary Effects from your components
- How to cache expensive computations without Effects
- How to reset and adjust component state without Effects
- How to share logic between event handlers
- Which logic should be moved to event handlers
- How to notify parent components about changes

### How to Remove Unnecessary Effects

There are two common cases in which you don’t need Effects:

1. **Transforming data for rendering**: You don’t need Effects to transform data for rendering. For example, if you want to filter a list before displaying it, you might feel tempted to write an Effect that updates a state variable when the list changes. However, this is inefficient. Instead, transform all the data at the top level of your components. That code will automatically re-run whenever your props or state change.

2. **Handling user events**: You don’t need Effects to handle user events. For example, if you want to send an `/api/buy` POST request and show a notification when the user buys a product, handle this in the event handler, not in an Effect.

**You do need Effects to synchronize with external systems.** For example, you can write an Effect that keeps a jQuery widget synchronized with the React state. You can also fetch data with Effects: for example, you can synchronize the search results with the current search query.

### Common Examples

#### Updating State Based on Props or State

Suppose you have a component with two state variables: `firstName` and `lastName`. You want to calculate a `fullName` from them by concatenating them. Instead of using an Effect to update `fullName`, calculate it during rendering:

```javascript
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  // ✅ Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
  // ...
}
```

#### Caching Expensive Calculations

If you have an expensive calculation, you can cache it using `useMemo`:

```javascript
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  const visibleTodos = useMemo(() => {
    // ✅ Does not re-run unless todos or filter change
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```

#### Resetting State When a Prop Changes

If you want to reset state when a prop changes, use a `key` to force React to recreate the component:

```javascript
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  );
}

function Profile({ userId }) {
  const [comment, setComment] = useState('');
  // ...
}
```

#### Sharing Logic Between Event Handlers

If you have logic that should run in response to user events, place it in the event handler, not in an Effect:

```javascript
function ProductPage({ product, addToCart }) {
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
  // ...
}
```

#### Fetching Data

When fetching data, ensure you handle race conditions by using a cleanup function:

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

### Recap

- If you can calculate something during render, you don’t need an Effect.
- To cache expensive calculations, add `useMemo` instead of `useEffect`.
- To reset the state of an entire component tree, pass a different `key` to it.
- To reset a particular bit of state in response to a prop change, set it during rendering.
- Code that runs because a component was displayed should be in Effects, the rest should be in events.
- If you need to update the state of several components, it’s better to do it during a single event.
- Whenever you try to synchronize state variables in different components, consider lifting state up.
- You can fetch data with Effects, but you need to implement cleanup to avoid race conditions.

