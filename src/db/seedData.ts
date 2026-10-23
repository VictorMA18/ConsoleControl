// Datos iniciales PROVISIONALES (TW-26). Se reemplazan por los reales del local cuando
// JS entregue el tarifario (T12) y el inventario. Los montos están en centavos: 350 = S/. 3.50.
// Los id son UUID fijos para que el mismo registro tenga el mismo id en todos los dispositivos.

import type { NewConsole, NewController, NewRate } from './schema';

export const CONTROLLERS_PER_CONSOLE = 4;

export const seedConsoles: NewConsole[] = [
  { id: '9be9a615-3d18-4f92-a2fe-bfef68268278', name: 'PS4 #1', consoleType: 'ps4' },
  { id: '551f976b-9f52-4e32-9db4-a2c938431f4f', name: 'PS5 #1', consoleType: 'ps5' },
  { id: '95bce93b-3e0a-401d-b7a6-65ae769ece61', name: 'Xbox #1', consoleType: 'xbox' },
  { id: 'fb64a232-3044-4929-99c9-8a0c7203cdac', name: 'Switch #1', consoleType: 'switch' },
];

export const seedControllers: NewController[] = [
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

// priceCents: precio con un mando. En tiempo libre, precio por hora.
// extraControllerCents: recargo por cada mando a partir del segundo (RN-01).
export const seedRates: NewRate[] = [
  {
    id: 'dcdab2e2-77df-4bce-8440-44a5b39e0789',
    consoleType: 'ps4',
    mode: 'fijo_30',
    priceCents: 200,
    extraControllerCents: 100,
  },
  {
    id: '68ca06b9-df02-4811-8145-ad9826613fbd',
    consoleType: 'ps4',
    mode: 'fijo_60',
    priceCents: 350,
    extraControllerCents: 100,
  },
  {
    id: '9227bebe-24b3-4d96-bd13-69607b31aa89',
    consoleType: 'ps4',
    mode: 'fijo_120',
    priceCents: 650,
    extraControllerCents: 100,
  },
  {
    id: '1fa16866-a62a-4c99-a8b4-a108e680acd4',
    consoleType: 'ps4',
    mode: 'libre',
    priceCents: 350,
    extraControllerCents: 100,
  },
  {
    id: 'e5b0e615-6075-4503-8ec4-a20c4c8070fd',
    consoleType: 'ps5',
    mode: 'fijo_30',
    priceCents: 300,
    extraControllerCents: 100,
  },
  {
    id: '641d252e-9443-4c5d-8afe-4a285ce3bf56',
    consoleType: 'ps5',
    mode: 'fijo_60',
    priceCents: 500,
    extraControllerCents: 100,
  },
  {
    id: '1aa9efd6-d697-4430-96a6-7b637687bcdf',
    consoleType: 'ps5',
    mode: 'fijo_120',
    priceCents: 900,
    extraControllerCents: 100,
  },
  {
    id: 'edfb7559-5c1e-4396-9699-97dcf8ae6a31',
    consoleType: 'ps5',
    mode: 'libre',
    priceCents: 500,
    extraControllerCents: 100,
  },
  {
    id: '98539446-a880-4c52-84db-1c1cce33fd9d',
    consoleType: 'xbox',
    mode: 'fijo_30',
    priceCents: 250,
    extraControllerCents: 100,
  },
  {
    id: 'aede72ee-953c-43a4-8f44-8c64d046cbf5',
    consoleType: 'xbox',
    mode: 'fijo_60',
    priceCents: 400,
    extraControllerCents: 100,
  },
  {
    id: 'e270f2bb-9ca7-4d7d-b089-23af6fd4b474',
    consoleType: 'xbox',
    mode: 'fijo_120',
    priceCents: 750,
    extraControllerCents: 100,
  },
  {
    id: 'fa23f605-499a-4e0a-b33d-3051230d9a56',
    consoleType: 'xbox',
    mode: 'libre',
    priceCents: 400,
    extraControllerCents: 100,
  },
  {
    id: '9cebc6ad-9b03-4276-9c0b-537415282876',
    consoleType: 'switch',
    mode: 'fijo_30',
    priceCents: 200,
    extraControllerCents: 100,
  },
  {
    id: '5a3448e4-12d4-460a-aed0-df0a0f82809b',
    consoleType: 'switch',
    mode: 'fijo_60',
    priceCents: 350,
    extraControllerCents: 100,
  },
  {
    id: '18a2dd72-a1a8-4213-9cb6-e38cb8e1ffd9',
    consoleType: 'switch',
    mode: 'fijo_120',
    priceCents: 650,
    extraControllerCents: 100,
  },
  {
    id: '782ecdb3-fbc1-4686-8fd1-770641b798c5',
    consoleType: 'switch',
    mode: 'libre',
    priceCents: 350,
    extraControllerCents: 100,
  },
];
