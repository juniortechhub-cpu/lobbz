const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall } = require("firebase-functions/v2/https");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();
const appIdAgoraUnico = "8b963b94108946ccb96fdc3934bdfed2";
const appCertificateAgoraUnico = "397008db87504a3aaf54dc4ee083daa0";

//=======================================
//   FUNÇÃO DE ATUALIZAR NOME DE USUARIO
///======================================
exports.atualizarNomeNosAmigos = onDocumentUpdated("usuarios/{uid}", async (event) => {
  const dadosAntigos = event.data.before.data();
  const dadosNovos = event.data.after.data();

  // Se o nome de usuário não mudou, encerra
  if (!dadosAntigos || !dadosNovos || dadosAntigos.nomeUsuario === dadosNovos.nomeUsuario) {
    return;
  }

  const uidUsuario = event.params.uid;
  const novoNome = dadosNovos.nomeUsuario;

  try {
    const amigosSnapshot = await db.collection("usuarios")
      .doc(uidUsuario)
      .collection("amigos")
      .get();

    if (amigosSnapshot.empty) {
      return;
    }

    const batch = db.batch();

    amigosSnapshot.forEach((docAmigo) => {
      const idDoAmigo = docAmigo.id;
      const refNoAmigo = db.collection("usuarios")
        .doc(idDoAmigo)
        .collection("amigos")
        .doc(uidUsuario);

      batch.update(refNoAmigo, { amigoUsername: novoNome });
    });

    await batch.commit();
    console.log(`Nome atualizado para ${novoNome} em todos os amigos.`);
  } catch (erro) {
    console.error("Erro ao atualizar nome nos amigos:", erro);
  }
});

//========================================
//   FUNÇÃO DE CHAMADA DE VOZ E VIDEO
//========================================
exports.gerarTokenAgora = onCall(async (request) => {
  const channelNameAgoraUnico = request.data.channelNameAgoraUnico;
  const uidAgoraUnico = request.data.uidAgoraUnico;
  const tempoAtualSegundosUnico = Math.floor(Date.now() / 1000);
  const tempoExpiracaoSegundosUnico = 3600;
  const tempoPrivilegioExpiraUnico = tempoAtualSegundosUnico + tempoExpiracaoSegundosUnico;
  const tokenAgoraGeradoUnico = RtcTokenBuilder.buildTokenWithUid(appIdAgoraUnico, appCertificateAgoraUnico, channelNameAgoraUnico, uidAgoraUnico, RtcRole.PUBLISHER, tempoPrivilegioExpiraUnico);
  return { tokenAgoraGeradoUnico: tokenAgoraGeradoUnico };
});