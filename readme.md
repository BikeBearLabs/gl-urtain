# `gl-urtain`

A WebGL 3D curtain effect, compiled into a Web Component.

## Installation

Firstly, build the project:

```bash
git clone https://github.com/BikeBearLabs/gl-urtain
cd gl-urtain
npm install
npm run build
```

Then, copy the built files from the `dist` directory to your project.

```bash
cp -r dist/* /path/to/your/project/gl-urtain/
```

Finally, include the script in your HTML:

```html
<script src="/path/to/your/project/gl-urtain/ index.js"></script>
```

> [!NOTE]
> The reason why the project isn't built as a standard module is because of its optimisation for synchronous loading. Since the curtain can be (& usually is) the first thing that a user sees when they visit the page, it should load as quickly as possible via a synchronous script tag instead of being included with the rest of your built JavaScript (i.e. an `import` that is run through Vite/Webpack).

## Usage

After including the script, you can use the component in your HTML:

```html
<gl-urtain></gl-urtain>
```

You can then grab an instance of the component and interact with it:

```javascript
const curtain = document.querySelector('gl-urtain');

// set the curtain to be 20% open
curtain.scrunchness = 0.6;
```

### React

Using React 19, you can use the component by just passing properties as props in your JSX:

```jsx
export default function App() {
	return <gl-urtain scrunchness={0.6} />;
}
```

> [!WARNING]
> Older versions of React (<19) have very compromised support for custom elements. You will have manually assign a `ref` to the component and interact with it within `useEffect` like in vanilla JavaScript instead of using props.

## Configuration

The component can be configured with the following attributes:

| Attribute      | Type                                                              | Description                                                                                                                                                                                        | Default   |
| -------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `scrunchness`  | `number`                                                          | The amount the curtain is open or "scrunched". Within the range of `0-1`, where `0.5` is the minimum amount the curtain remains closed (as `0` is if two sides of the curtains overlap completely) | `0.5`     |
| `lightColor`   | ``[r: number, b: number, g: number, a: number] \| `#${string}` `` | The color of the light that shines on the curtain                                                                                                                                                  | `#ffffff` |
| `shadowColor`  | ``[r: number, b: number, g: number, a: number] \| `#${string}` `` | The color of the shadow that is cast on the curtain                                                                                                                                                | `#9c8c7c` |
| `diffuseColor` | ``[r: number, b: number, g: number, a: number] \| `#${string}` `` | The color of the curtain itself                                                                                                                                                                    | `#fff4e6` |
| `playing`      | `boolean`                                                         | Whether the curtain is currently running. Set to `false` to "pause" the simulation                                                                                                                 | `true`    |

## License

MIT
