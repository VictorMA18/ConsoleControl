// Datos iniciales PROVISIONALES. Las tarifas vienen del CSV del documento de T12 «Tarifas base
// y regla de recargo por mando adicional», pendientes de confirmar con JS: el documento trae otros
// precios en sus tablas. Las consolas y mandos son de ejemplo hasta tener el inventario real.
// Montos en céntimos: 350 = S/ 3.50. Los id son UUID fijos para que el mismo registro tenga el
// mismo id en todos los dispositivos.

import type { NewConsole, NewController, NewRate } from './schema';

export const CONTROLLERS_PER_CONSOLE = 4;

export const seedConsoles: NewConsole[] = [
  { id: '2c26a7b0-b208-44c7-b905-8de14c44db65', name: 'PS3 #1', consoleType: 'ps3' },
  { id: '9be9a615-3d18-4f92-a2fe-bfef68268278', name: 'PS4 #1', consoleType: 'ps4' },
  { id: '551f976b-9f52-4e32-9db4-a2c938431f4f', name: 'PS5 #1', consoleType: 'ps5' },
  { id: '95bce93b-3e0a-401d-b7a6-65ae769ece61', name: 'Xbox #1', consoleType: 'xbox' },
  { id: 'fb64a232-3044-4929-99c9-8a0c7203cdac', name: 'Switch #1', consoleType: 'switch' },
];

export const seedControllers: NewController[] = [
  {
    id: 'f94cc95a-4a4b-48a6-b88d-edfbcf8ddd67',
    consoleId: '2c26a7b0-b208-44c7-b905-8de14c44db65',
    label: 'Mando 1',
  },
  {
    id: '437ce38b-138f-4c95-a643-b50d17cd7654',
    consoleId: '2c26a7b0-b208-44c7-b905-8de14c44db65',
    label: 'Mando 2',
  },
  {
    id: '15a1f523-3809-4d11-bb31-72b5f717888a',
    consoleId: '2c26a7b0-b208-44c7-b905-8de14c44db65',
    label: 'Mando 3',
  },
  {
    id: '5d454108-6993-4c8c-b811-e705402905ee',
    consoleId: '2c26a7b0-b208-44c7-b905-8de14c44db65',
    label: 'Mando 4',
  },
  {
    id: '2c2bd3c7-3c13-4112-80f0-ff97e1743649',
    consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
    label: 'Mando 1',
  },
  {
    id: '59dc9cd5-bf3c-4286-b7b0-cadfc2f718e3',
    consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
    label: 'Mando 2',
  },
  {
    id: '92a9aa26-f0b8-40cd-b11d-3c150695362b',
    consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
    label: 'Mando 3',
  },
  {
    id: '35e597c6-b1d0-4b7d-bb06-2e9248e74e34',
    consoleId: '9be9a615-3d18-4f92-a2fe-bfef68268278',
    label: 'Mando 4',
  },
  {
    id: 'dba6c4fd-1951-4c3e-a235-0deef5260576',
    consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    label: 'Mando 1',
  },
  {
    id: '4f400f74-6d5f-4794-a64d-a8ab01944fd6',
    consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    label: 'Mando 2',
  },
  {
    id: '5cae3c53-9e2a-46f9-ab4a-b4544544c90b',
    consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    label: 'Mando 3',
  },
  {
    id: '754d90a9-9afb-4a46-9d0c-c32cfe916678',
    consoleId: '551f976b-9f52-4e32-9db4-a2c938431f4f',
    label: 'Mando 4',
  },
  {
    id: 'f118a786-e2d1-4c94-ba4d-15308fbfffb0',
    consoleId: '95bce93b-3e0a-401d-b7a6-65ae769ece61',
    label: 'Mando 1',
  },
  {
    id: '96a2f881-9779-439c-93d4-c1bb73ba967f',
    consoleId: '95bce93b-3e0a-401d-b7a6-65ae769ece61',
    label: 'Mando 2',
  },
  {
    id: '98b1a19a-1d77-4186-a6a7-4b631742d8ae',
    consoleId: '95bce93b-3e0a-401d-b7a6-65ae769ece61',
    label: 'Mando 3',
  },
  {
    id: '1837c33f-ddb3-4cfd-b8e2-d8d566d85fc7',
    consoleId: '95bce93b-3e0a-401d-b7a6-65ae769ece61',
    label: 'Mando 4',
  },
  {
    id: '2e1193fc-20b0-400c-b6bf-ba0345ff9992',
    consoleId: 'fb64a232-3044-4929-99c9-8a0c7203cdac',
    label: 'Mando 1',
  },
  {
    id: '45b1439d-9313-4ca4-8b19-58ff31a4dc01',
    consoleId: 'fb64a232-3044-4929-99c9-8a0c7203cdac',
    label: 'Mando 2',
  },
  {
    id: '19bc97e8-4e01-4d6d-8ae7-6e135ae2502e',
    consoleId: 'fb64a232-3044-4929-99c9-8a0c7203cdac',
    label: 'Mando 3',
  },
  {
    id: '1e9633f8-9ed8-4106-9385-4dc61a81174b',
    consoleId: 'fb64a232-3044-4929-99c9-8a0c7203cdac',
    label: 'Mando 4',
  },
];

// priceCents: precio del bloque con un mando.
// extraControllerCents: recargo del bloque por cada mando desde el segundo (RN-01).
export const seedRates: NewRate[] = [
  {
    id: '9c30d8b8-ca6a-489e-b4e9-7afa2ba72753',
    consoleType: 'ps3',
    blockMinutes: 15,
    priceCents: 150,
    extraControllerCents: 50,
  },
  {
    id: '171caaef-a326-4a6e-ab26-b105faf628e4',
    consoleType: 'ps3',
    blockMinutes: 30,
    priceCents: 250,
    extraControllerCents: 100,
  },
  {
    id: 'fd830f25-dba1-4c6d-98af-2ecd7dad7473',
    consoleType: 'ps3',
    blockMinutes: 45,
    priceCents: 400,
    extraControllerCents: 150,
  },
  {
    id: '5a189855-5dbf-43ab-b954-f992d22f36e7',
    consoleType: 'ps3',
    blockMinutes: 60,
    priceCents: 500,
    extraControllerCents: 200,
  },
  {
    id: '8e6fe1d7-3ce7-4bec-8f10-17891b0b7595',
    consoleType: 'ps3',
    blockMinutes: 120,
    priceCents: 900,
    extraControllerCents: 350,
  },
  {
    id: '5c0cbc0c-9a65-46a5-9777-da01eed84eb7',
    consoleType: 'ps4',
    blockMinutes: 15,
    priceCents: 200,
    extraControllerCents: 100,
  },
  {
    id: '5c537156-13fd-4a47-8884-705430fe4fc1',
    consoleType: 'ps4',
    blockMinutes: 30,
    priceCents: 350,
    extraControllerCents: 150,
  },
  {
    id: 'f39b69f8-8b35-4431-a451-cf098bd7a684',
    consoleType: 'ps4',
    blockMinutes: 45,
    priceCents: 550,
    extraControllerCents: 250,
  },
  {
    id: 'ccef4997-bf61-4057-9ec8-1f054373438c',
    consoleType: 'ps4',
    blockMinutes: 60,
    priceCents: 700,
    extraControllerCents: 300,
  },
  {
    id: '05a48985-652c-47d8-95b4-375f7ed8b42f',
    consoleType: 'ps4',
    blockMinutes: 120,
    priceCents: 1300,
    extraControllerCents: 550,
  },
  {
    id: '96dc38a6-cc6f-44b0-bb80-0620ee3eebfd',
    consoleType: 'switch',
    blockMinutes: 15,
    priceCents: 200,
    extraControllerCents: 100,
  },
  {
    id: 'cd822fba-0993-4f97-bd99-7db5efc3c5d5',
    consoleType: 'switch',
    blockMinutes: 30,
    priceCents: 400,
    extraControllerCents: 200,
  },
  {
    id: '9bf1fb38-76be-4b76-bfea-7c62f171e461',
    consoleType: 'switch',
    blockMinutes: 45,
    priceCents: 600,
    extraControllerCents: 300,
  },
  {
    id: '8e425332-7680-46d8-8a0b-313d243a93e6',
    consoleType: 'switch',
    blockMinutes: 60,
    priceCents: 800,
    extraControllerCents: 350,
  },
  {
    id: '9503b6e0-10b1-4191-8e17-eada28ee6500',
    consoleType: 'switch',
    blockMinutes: 120,
    priceCents: 1500,
    extraControllerCents: 650,
  },
  {
    id: '42865978-79b1-4925-9321-1ea52a31bc5d',
    consoleType: 'ps5',
    blockMinutes: 15,
    priceCents: 250,
    extraControllerCents: 150,
  },
  {
    id: '80572c0d-0e46-4057-924d-a234b4aa6011',
    consoleType: 'ps5',
    blockMinutes: 30,
    priceCents: 500,
    extraControllerCents: 250,
  },
  {
    id: '2143695e-6ce9-4928-a5a6-3aa4fdfdbf25',
    consoleType: 'ps5',
    blockMinutes: 45,
    priceCents: 750,
    extraControllerCents: 350,
  },
  {
    id: '2e27c300-67ec-4910-b5e8-f536c3c16333',
    consoleType: 'ps5',
    blockMinutes: 60,
    priceCents: 1000,
    extraControllerCents: 450,
  },
  {
    id: 'b98a8875-353d-4572-bebe-bb047af12d59',
    consoleType: 'ps5',
    blockMinutes: 120,
    priceCents: 1900,
    extraControllerCents: 850,
  },
  {
    id: '268c85d8-b07b-4c83-98da-1ce48bc9b94a',
    consoleType: 'xbox',
    blockMinutes: 15,
    priceCents: 250,
    extraControllerCents: 150,
  },
  {
    id: '9fdcb3a3-9785-4887-8e48-c958b1c5a695',
    consoleType: 'xbox',
    blockMinutes: 30,
    priceCents: 500,
    extraControllerCents: 250,
  },
  {
    id: 'aa5aad3d-af03-494d-bc8d-e39e3743748f',
    consoleType: 'xbox',
    blockMinutes: 45,
    priceCents: 750,
    extraControllerCents: 350,
  },
  {
    id: '58f11c9d-314b-401a-bb60-e8a687e0c81a',
    consoleType: 'xbox',
    blockMinutes: 60,
    priceCents: 1000,
    extraControllerCents: 450,
  },
  {
    id: 'da0b939a-891e-4650-a3c2-6529463e3e28',
    consoleType: 'xbox',
    blockMinutes: 120,
    priceCents: 1900,
    extraControllerCents: 850,
  },
];
