Keep your explainations brief and to the point.

# Prefer not to use brackets in typescript unless its a multi-line statement. 

Instead of something like this:

```ts
if (someVariable == 42) {
  return "the answer";
}
```

You should use this:

```ts
if (someVariable == 42)
  return "the answer";
```

Unless its multi-line then you may use brackets:

```ts
if (someVariable == 42) {
  console.log("calculating..")
  return "the answer";
}
    
```

# Prefer to "early out" in functions rather than nesting statements. 

Instead of this:

```ts
let theResult = "";
if (someVariable == 42) {
  theResult = "the answer";
}
else if (someVariable == 69) {
  theResult = "nice";
}
else {
  theResult = "nope";
}
return theResult
```

You should write this:

```ts
if (someVariable == 42) 
  return "the answer";

if (someVariable == 69) 
  return "nice";

return "nope";
```

# Prefer to use the "object in object out" pattern when writing typescript functions.

So instead of writing this:

```ts
function myFunction(firstArg: string, second: number, isSomething?: boolean) {
  // ...
}
```

You should write:

```ts
function myFunction({ firstArg, second, isSomething }: { firstArg: string, second: number, isSomething?: boolean }) {
  // ...
}
```

If the function needs to return multiple values then return an object:

```ts
function calculateSomething() {
  return {
    theAnswer: 42,
    reason: "the computer said so"
  }
}
```

# When doing react code, prefer to put the event handlers inline with the elements rather than hoisting them up to the top of the component. 

So instead of writing this:

```tsx
import * as React from "react";

export const MyComp: React.FC = ({}) => {
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("hello");
  };
  return <button onClick={handleOnClick}>Say Hello</button>;
};
```

Write this:

```tsx
import * as React from "react";

export const MyComp: React.FC = ({}) => {
  return <button onClick={() => console.log("hello") }>Say Hello</button>;
};
```

If the logic needs to be called from multiple places in the component then use a helper function:

```tsx
import * as React from "react";

export const MyComp: React.FC = ({}) => {
  const closeDialog = () => {
    // ...
  };
  return (
    <div>
      <button onClick={() => closeDialog()}>Close</button>;
      <div onClick={() => closeDialog()}></div>
    </div>
  );
};
```

# Prefer to use bun as the package manger over npm or yarn unless the project is specifically using those.

# Prefer if-statements with early returns over switch statements.

Instead of this:

```ts
function doSomething(kind: MyKind) {
  switch (kind) {
    case "a":
      return "it was A";
    case "b":
      return "it was B";
    case "c":
      return "it was C";
  }
}
```

Prefer this:

```ts
function doSomething(kind: MyKind) {
  if (kind === "a") return "it was A";
  if (kind === "b") return "it was B";
  if (kind === "c") return "it was C";
}
```

# You should generally never use the non-null assertion operator to trick the typescript compiler.

You should never do this:

```ts
function doSomething(myObj: { value: string } | null) {
  console.log(myObj!.value);
}
```

Instead do this:

```ts
function doSomething(myObj: { value: string } | null) {
  if (!myObj) throw new Error("myObj is null");
  console.log(myObj.value);
}
```