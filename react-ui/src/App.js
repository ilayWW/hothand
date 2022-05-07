import "./App.css";
import MainAppBar from "./components/MainAppBar.component";
import MainPage from "./components/MainPage.component";

function App() {
  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <MainAppBar />
      <MainPage />
    </div>
  );
}

export default App;
