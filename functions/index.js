const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

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