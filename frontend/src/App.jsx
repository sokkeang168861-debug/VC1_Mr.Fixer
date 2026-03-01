import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/frontpage/Navbar';
import Footer from './components/frontpage/Footer';
import Home from './pages/frontpage/index';
import Services from './pages/frontpage/Services';
import Contact from './pages/frontpage/Contact';
import Login from './pages/frontpage/Login';
import Signup from './pages/frontpage/Signup';

// function App() {
//   const [count, setCount] = useState(0)
//   const [array, setArray] = useState([]);

//   const fetchAPI = async () => {
//     const response = await axios.get("http://localhost:5000/api");
//     setArray(response.data.fruits);
//     console.log(response.data.fruits);
//   };

//   useEffect(() => {
//     fetchAPI();
//   }, []);

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//         {
//           array.map((fruit, index) => (
//             <div key= {index}>
//               <p>{fruit}</p><br />
//             </div>
//           ))
//         }
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
