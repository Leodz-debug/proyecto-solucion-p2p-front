// Utilidades centralizadas para métodos de recepción/pago P2P.
// En CambioSeguro P2P la plataforma NO cobra automáticamente: el comprador paga
// fuera de la app usando los datos publicados por el vendedor y luego sube voucher.

export function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function iconoMetodo(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) return 'phone_iphone'
  if (nombre.includes('transferencia') || nombre.includes('banco')) return 'account_balance'
  if (nombre.includes('paypal')) return 'alternate_email'
  if (nombre.includes('tarjeta') || nombre.includes('card')) return 'credit_card'

  return 'payments'
}

export function etiquetaDatoRecepcion(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin'))
    return 'Celular Yape/Plin donde recibirás el pago'
  if (nombre.includes('transferencia') || nombre.includes('banco'))
    return 'Cuenta bancaria o CCI donde recibirás el pago'
  if (nombre.includes('paypal')) return 'Correo PayPal donde recibirás el pago'
  if (nombre.includes('tarjeta')) return 'Referencia segura de tarjeta del vendedor'

  return 'Datos donde recibirás el pago'
}

export function placeholderDatoRecepcion(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) return 'Ejemplo: 987654321'
  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return 'Ejemplo: BCP 191-00000000-0-00 / CCI 002...'
  }
  if (nombre.includes('paypal')) return 'Ejemplo: correo@dominio.com'
  if (nombre.includes('tarjeta')) return 'Ejemplo: Visa terminada en 1234'

  return 'Escribe tus datos de recepción'
}

export function descripcionMetodo(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape')) return 'Pago manual al celular Yape del vendedor.'
  if (nombre.includes('plin')) return 'Pago manual al celular Plin del vendedor.'
  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return 'Transferencia manual a la cuenta bancaria del vendedor.'
  }
  if (nombre.includes('paypal')) return 'Pago manual al correo PayPal del vendedor.'
  if (nombre.includes('tarjeta'))
    return 'Referencia manual; no procesa ni guarda CVV o número completo.'

  return 'Método configurado por el vendedor.'
}

export function camposPorMetodo(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular que recibirá el pago',
        placeholder: 'Ejemplo: Ana Torres',
        required: true,
      },
      {
        key: 'telefono',
        label: 'Número celular afiliado',
        placeholder: 'Ejemplo: 987654321',
        maxlength: 9,
        required: true,
      },
    ]
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular de la cuenta',
        placeholder: 'Ejemplo: Ana Torres',
        required: true,
      },
      {
        key: 'banco',
        label: 'Banco',
        placeholder: 'Ejemplo: BCP, Interbank, BBVA',
        required: true,
      },
      {
        key: 'cuenta',
        label: 'Cuenta o CCI',
        placeholder: 'Ejemplo: 191-xxxx o CCI 002...',
        required: true,
      },
    ]
  }

  if (nombre.includes('paypal')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Ejemplo: Ana Torres',
        required: true,
      },
      {
        key: 'correo',
        label: 'Correo PayPal que recibirá el pago',
        placeholder: 'Ejemplo: correo@dominio.com',
        type: 'email',
        required: true,
      },
    ]
  }

  if (nombre.includes('tarjeta')) {
    return [
      {
        key: 'titular',
        label: 'Nombre del titular',
        placeholder: 'Como aparece en la tarjeta',
        required: true,
      },
      {
        key: 'marca',
        label: 'Marca',
        placeholder: 'Ejemplo: Visa, Mastercard',
        required: true,
      },
      {
        key: 'ultimos4',
        label: 'Últimos 4 dígitos',
        placeholder: 'Ejemplo: 1234',
        maxlength: 4,
        required: true,
      },
    ]
  }

  return [
    {
      key: 'titular',
      label: 'Nombre asociado al método',
      placeholder: 'Nombre del titular o receptor',
      required: true,
    },
    {
      key: 'referencia',
      label: 'Referencia de recepción',
      placeholder: 'Número, cuenta, correo o referencia',
      required: true,
    },
  ]
}

export function validarDatosMetodo(nombreMetodo, datos = {}) {
  const campos = camposPorMetodo(nombreMetodo)
  const faltante = campos.find((campo) => campo.required && !String(datos[campo.key] || '').trim())

  if (faltante) return `Completa el campo: ${faltante.label}.`

  const nombre = normalizarTexto(nombreMetodo)

  if (
    (nombre.includes('yape') || nombre.includes('plin')) &&
    !/^\d{9}$/.test(datos.telefono || '')
  ) {
    return 'El celular debe tener 9 dígitos.'
  }

  if (nombre.includes('paypal') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo || '')) {
    return 'Ingresa un correo PayPal válido.'
  }

  if (nombre.includes('tarjeta') && !/^\d{4}$/.test(datos.ultimos4 || '')) {
    return 'Para tarjeta, ingresa exactamente los últimos 4 dígitos.'
  }

  return ''
}

export function referenciaPrincipal(datos = {}) {
  for (const key of ['telefono', 'cuenta', 'correo', 'ultimos4', 'referencia', 'banco']) {
    const valor = String(datos[key] || '').trim()
    if (valor) return valor
  }

  return Object.values(datos).find((valor) => String(valor || '').trim()) || 'registrado'
}

export function datoRecepcionDesdeDatos(nombreMetodo, datos = {}) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return datos.telefono || datos.celular || datos.referencia || referenciaPrincipal(datos)
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    const banco = String(datos.banco || '').trim()
    const cuenta = String(datos.cuenta || datos.cci || datos.referencia || '').trim()
    return [banco, cuenta].filter(Boolean).join(' - ') || referenciaPrincipal(datos)
  }

  if (nombre.includes('paypal')) return datos.correo || datos.email || referenciaPrincipal(datos)

  if (nombre.includes('tarjeta')) {
    const marca = String(datos.marca || '').trim()
    const ultimos4 = String(datos.ultimos4 || '').trim()
    return (
      [marca, ultimos4 ? `terminada en ${ultimos4}` : ''].filter(Boolean).join(' ') ||
      referenciaPrincipal(datos)
    )
  }

  return referenciaPrincipal(datos)
}

export function enmascararReferencia(valor) {
  const texto = String(valor || '').trim()

  if (!texto) return 'registrado'
  if (texto.includes('@')) {
    const [usuario, dominio] = texto.split('@')
    return `${usuario.slice(0, 2)}***@${dominio}`
  }
  if (texto.length <= 4) return texto

  return `****${texto.slice(-4)}`
}

export function crearResumenPublico(nombreMetodo, datos = {}, alias = '') {
  const referencia = referenciaPrincipal(datos)
  const prefijo = alias || nombreMetodo || 'Método de recepción'
  return `${prefijo}: ${enmascararReferencia(referencia)}`
}

export function instruccionesSugeridas(nombreMetodo) {
  const nombre = normalizarTexto(nombreMetodo)

  if (nombre.includes('yape') || nombre.includes('plin')) {
    return 'Envía el monto exacto y coloca el código de operación en la descripción del pago.'
  }

  if (nombre.includes('transferencia') || nombre.includes('banco')) {
    return 'Transfiere el monto exacto y coloca el código de operación como referencia.'
  }

  if (nombre.includes('paypal')) {
    return 'Envía el monto exacto al correo indicado y conserva el comprobante de PayPal.'
  }

  if (nombre.includes('tarjeta')) {
    return 'Coordina el pago según la referencia indicada. No compartas CVV ni número completo de tarjeta.'
  }

  return 'Realiza el pago exacto y conserva el comprobante.'
}
