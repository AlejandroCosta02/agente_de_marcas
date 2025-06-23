"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/lib/db");
const subscription_plans_1 = require("../src/lib/subscription-plans");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Hardcode the user email and plan for manual upgrade
        const userEmail = 'lucianadinoto@gmail.com';
        const planId = 'master';
        const billingCycle = 'yearly';
        if (!userEmail) {
            console.error('Por favor, proporciona el email del usuario.');
            process.exit(1);
        }
        const user = yield db_1.db.user.findUnique({
            where: { email: userEmail },
        });
        if (!user) {
            console.error(`No se encontró ningún usuario con el email: ${userEmail}`);
            process.exit(1);
        }
        const plan = (0, subscription_plans_1.getPlanById)(planId);
        if (!plan) {
            console.error(`Plan con ID "${planId}" no encontrado.`);
            process.exit(1);
        }
        const startDate = new Date();
        const endDate = new Date();
        if (billingCycle === 'yearly') {
            endDate.setFullYear(startDate.getFullYear() + 1);
        }
        else if (billingCycle === 'monthly') {
            endDate.setMonth(startDate.getMonth() + 1);
        }
        else {
            console.error('Ciclo de facturación no válido. Usa "monthly" o "yearly".');
            process.exit(1);
        }
        const subscriptionData = {
            userId: user.id,
            tier: plan.id,
            startDate,
            endDate,
            status: 'active',
        };
        yield db_1.db.userSubscription.upsert({
            where: { userId: user.id },
            update: subscriptionData,
            create: subscriptionData,
        });
        console.log(`¡Éxito! El usuario ${user.name} (${user.email}) ahora tiene el plan ${plan.name} (${billingCycle}).`);
        console.log(`La suscripción es válida hasta: ${endDate.toLocaleDateString('es-AR')}`);
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.$disconnect();
}));
