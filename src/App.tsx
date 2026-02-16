import { Route, Switch } from "wouter";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Incinerator } from "./views/Incinerator";
import { BlackoutEngine } from "./views/BlackoutEngine";
import { PhantomPayload } from "./views/PhantomPayload";
import { Settings } from "./views/Settings";

function App() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Incinerator} />
        <Route path="/blackout-engine" component={BlackoutEngine} />
        <Route path="/phantom-payload" component={PhantomPayload} />
        <Route path="/settings" component={Settings} />
        <Route>
            <div className="flex h-full items-center justify-center text-zinc-500">
                404: SECTOR NOT FOUND
            </div>
        </Route>
      </Switch>
    </DashboardLayout>
  );
}

export default App;
