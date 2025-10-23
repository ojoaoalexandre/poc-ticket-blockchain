import { WalletConnect } from '../components/wallet';
import { MintTicketForm } from '../components/mint/MintTicketForm';

export function MintTicket() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-3xl">🎨</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                Criar Ticket NFT
              </h1>
              <p className="mt-1">
                Emita um novo ingresso digital na blockchain Polygon
              </p>
            </div>
          </div>

        </div>

          <WalletConnect />
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">Como funciona?</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">1️⃣</span>
                  <span>Preencha os dados do evento e do ingresso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">2️⃣</span>
                  <span>Uma imagem única será gerada automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">3️⃣</span>
                  <span>A imagem e metadados serão armazenados no IPFS (descentralizado)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">4️⃣</span>
                  <span>O NFT será mintado na blockchain Polygon Amoy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">5️⃣</span>
                  <span>Você poderá visualizar seu ticket no OpenSea!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <MintTicketForm />
      </div>
    </div>
  );
}

