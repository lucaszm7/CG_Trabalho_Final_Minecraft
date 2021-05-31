// CREATE ALL THE MATRIX NEEDED, MODEL MATRIX, VIEW MATRIX,
// PROJECTION MATRIX AND MODEL-VIEW-PROJECTION MATRIX
//=============================================================//
// MODEL MATRIX É A MATRIX DO OBJETO, MUDANDO ELE PARA O MUNDO
// DANDO SUA RELAÇÃO COM OS OUTROS OBJETOS
//=============================================================//
// VIEW MATRIX É A MATRIX DA "CAMERA" A PARTIR DE ONDE ESTAMOS VENDO O MUNDO
// MUDAR ELA MUDA A POSIÇÃO DE TODOS OBJETOS, POIS É COMO SE ESTIVESSEMOS
// NOS MOVENDO
//=============================================================//
// PROJECTION MATRIX É A MATRIX DA PERSPECTIVE OU PARALELA (DEPENDE DO ANGULO??)
// MUDANDO ELA É COMO SE MUDASSEMOS NOSSOS OLHOS(???)
// =============================================================//
// A ULTIMA MATRIX JUNTA TUDO ISSO, DIZENDO ONDE O OBJETO ESTA NA CENA, DE ONDE
// ESTAMOS VENDO O OBJETO E COMO ESTAMOS VENDO O OBJETO, MANDANDO ISSO PARA 
// A GPU DESENHAR!!!

// === PIPELINE === //

    // 1TH
    // create an VertexData = [...];
    // create GpuBuffer;
    // Attach GpuBuffer to VertexData

    // 2TH
    // create vertex-shader;
    // create fragment-shader;
    // create program;
    // attach shader to program;

    // 3TH
    // ennable vertex-attributes;

    // draw

// === END OF PIPE === //