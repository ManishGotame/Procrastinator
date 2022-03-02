import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Home from "../pages/Home";

//

import Mint from "../Mint";

function routes() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/mint">
          <Mint />
        </Route>
      </Switch>

      <Footer />
    </Router>
  );
}

export default routes;
