import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Slider } from "@components/ui/slider";
import { Textarea } from "@components/ui/textarea";
import { type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";

const weapons = [
  {
    id: 1,
    name: "Laser",
    src: "https://robohash.org/laser?set=set2&size=32x32",
    description:
      "A high-energy beam weapon. Excellent for precision strikes and can penetrate most armor types. Low cooldown but moderate energy consumption.",
  },
  {
    id: 2,
    name: "Missile",
    src: "https://robohash.org/missile?set=set2&size=32x32",
    description:
      "Explosive projectile with tracking capabilities. High damage potential with area effect. Limited ammo capacity but devastating against grouped enemies.",
  },
  {
    id: 3,
    name: "Sword",
    src: "https://robohash.org/sword?set=set2&size=32x32",
    description:
      "Energy-infused melee weapon. Requires close combat but deals consistent damage. Low energy consumption and can deflect incoming projectiles.",
  },
  {
    id: 4,
    name: "Flamethrower",
    src: "https://robohash.org/flamethrower?set=set2&size=32x32",
    description:
      "Short-range but high damage over time. Effective against multiple opponents and can ignite flammable terrain. Consumes fuel rapidly.",
  },
  {
    id: 5,
    name: "Cannon",
    src: "https://robohash.org/cannon?set=set2&size=32x32",
    description:
      "Heavy artillery with massive firepower. Slow rate of fire but deals enormous damage. Can destroy obstacles and has a long range.",
  },
];

const MAX_POINTS = 10;

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  // Get form values
  const attack = Number(formData.get("attack"));
  const defense = Number(formData.get("defense"));
  const speed = Number(formData.get("speed"));
  const fuel = Number(formData.get("fuel"));
  const selectedWeapon = Number(formData.get("selectedWeapon"));
  const battlePrompt = formData.get("battlePrompt")?.toString() || "";

  // Validate required fields
  if (!attack || !defense || !speed || !fuel || !selectedWeapon) {
    return new Response(JSON.stringify({ error: "All fields are required" }), {
      status: 400,
    });
  }

  // Only send user-configurable fields
  const botData = {
    Attack: attack,
    Defense: defense,
    Speed: speed,
    Fuel: fuel,
    weaponChoice: selectedWeapon,
    prompt: battlePrompt,
  };

  try {
    const response = await fetch("/registerBot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot: botData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error: error.message }), {
        status: response.status,
      });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to register bot" }), {
      status: 500,
    });
  }
};

export default function NewBot() {
  const actionData = useActionData<typeof action>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [battlePrompt, setBattlePrompt] = useState("");
  const [attack, setAttack] = useState(2);
  const [defense, setDefense] = useState(2);
  const [speed, setSpeed] = useState(2);
  const [fuel, setFuel] = useState("");
  const [wager, setWager] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState<number>(1);

  const totalPoints = attack + defense + speed;
  const remainingPoints = Number(MAX_POINTS - totalPoints).toFixed(1);
  const isMaxedOut = totalPoints >= MAX_POINTS;

  const handleStatChange = (value: number, setter: (value: number) => void, currentValue: number) => {
    const otherStats = totalPoints - currentValue;
    if (otherStats + value <= MAX_POINTS) {
      setter(Number(value.toFixed(1)));
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-mono p-4 overflow-auto">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-yellow-400 pixelated">
          Battle Bot Builder
        </h1>

        {actionData?.success && (
          <div className="mb-4 p-4 bg-green-400/20 text-green-400 rounded-lg pixelated-border">
            Bot created successfully!
          </div>
        )}

        <Form method="post" className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-900 p-6 rounded-lg pixelated-border">
            <div className="md:col-span-2 space-y-6">
              <div className="relative w-full h-96 border-4 border-gray-700 rounded-lg flex items-center justify-center bg-gray-800 pixelated-border">
                <img
                  src="https://robohash.org/battlebot?set=set1&size=256x256"
                  alt="Base Robot"
                  width={256}
                  height={256}
                  className="pixelated"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuel" className="text-lg text-green-400">
                    Fuel (USDC)
                  </Label>
                  <Input
                    id="fuel"
                    name="fuel"
                    type="number"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    placeholder="Enter USDC amount"
                    className="mt-1 bg-gray-800 border-gray-700 text-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor="wager" className="text-lg text-red-400">
                    Wager (USDC)
                  </Label>
                  <Input
                    id="wager"
                    name="wager"
                    type="number"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                    placeholder="Enter wager amount"
                    className="mt-1 bg-gray-800 border-gray-700 text-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-gray-800 p-4 rounded-lg pixelated-border">
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-400">Points System</p>
                <p className="text-xs text-gray-500 mt-1">Allocate up to {MAX_POINTS} points across Attack, Defense, and Speed</p>
                <p className={`text-lg font-bold mt-2 ${Number(remainingPoints) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {remainingPoints} points remaining
                </p>
              </div>

              <input type="hidden" name="attack" value={attack} />
              <input type="hidden" name="defense" value={defense} />
              <input type="hidden" name="speed" value={speed} />
              <input
                type="hidden"
                name="selectedWeapon"
                value={selectedWeapon}
              />

              <div>
                <Label className="text-lg text-blue-400">Attack</Label>
                <Slider
                  min={2}
                  max={4}
                  step={0.1}
                  value={[attack]}
                  onValueChange={(value) => handleStatChange(value[0], setAttack, attack)}
                  className="my-2"
                  disabled={isMaxedOut && attack <= 2}
                />
                <span className="text-lg font-semibold text-blue-400">
                  {attack.toFixed(1)}
                </span>
              </div>

              <div>
                <Label className="text-lg text-yellow-400">Defense</Label>
                <Slider
                  min={2}
                  max={4}
                  step={0.1}
                  value={[defense]}
                  onValueChange={(value) => handleStatChange(value[0], setDefense, defense)}
                  className="my-2"
                  disabled={isMaxedOut && defense <= 2}
                />
                <span className="text-lg font-semibold text-yellow-400">
                  {defense.toFixed(1)}
                </span>
              </div>

              <div>
                <Label className="text-lg text-green-400">Speed</Label>
                <Slider
                  min={2}
                  max={4}
                  step={0.1}
                  value={[speed]}
                  onValueChange={(value) => handleStatChange(value[0], setSpeed, speed)}
                  className="my-2"
                  disabled={isMaxedOut && speed <= 2}
                />
                <span className="text-lg font-semibold text-green-400">
                  {speed.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg pixelated-border mb-8 min-h-[200px]">
            <h2 className="text-2xl font-semibold mb-4 text-center text-yellow-400">
              Weapons
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {weapons.map((weapon) => (
                <button
                  key={weapon.id}
                  type="button"
                  onClick={() => setSelectedWeapon(weapon.id)}
                  className={`cursor-pointer transition-all p-2 rounded-lg ${
                    selectedWeapon === weapon.id
                      ? "scale-110 bg-yellow-400/20 border-2 border-yellow-400"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <img
                    src={weapon.src || "/placeholder.svg"}
                    alt={weapon.name}
                    width={32}
                    height={32}
                    className="pixelated mx-auto"
                  />
                  <p className="text-center text-xs mt-1 text-white">
                    {weapon.name}
                  </p>
                </button>
              ))}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg pixelated-border h-[100px] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                {weapons.find((w) => w.id === selectedWeapon)?.name}
              </h3>
              <p className="text-sm text-white">
                {weapons.find((w) => w.id === selectedWeapon)?.description}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg pixelated-border">
            <Label
              htmlFor="battle-prompt"
              className="text-xl text-purple-400 mb-2 block"
            >
              Battle Prompt
            </Label>
            <Textarea
              id="battle-prompt"
              name="battlePrompt"
              value={battlePrompt}
              onChange={(e) => setBattlePrompt(e.target.value)}
              placeholder="Enter your epic battle prompt here..."
              className="w-full h-48 text-lg p-4 bg-gray-800 border-gray-700 text-purple-400 mb-4"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-black transition-colors duration-200"
            >
              {isSubmitting ? "CREATING BATTLE BOT..." : "CREATE BATTLE BOT"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
