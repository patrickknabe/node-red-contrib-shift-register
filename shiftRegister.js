module.exports = RED => {
	RED.nodes.registerType( 'shift register', function( config ) {
		RED.nodes.createNode( this, config );

		let value = 0;

		const updateStatus = flash => {
			let text = '';

			for( let idx = 0; idx < config.outputs; idx++ ) {
				text = `${ ( value >> idx ) & 1 }${ text }`
			}

			if( flash ) {
				this.status( { fill: 'green', shape: 'dot', text } );
				setTimeout( updateStatus, 250, false );
			} else {
				this.status( { fill: 'grey', shape: 'dot', text } );
			}
		};

		updateStatus( false );

		this.on( 'input', msg => {
			const msgs = [];
			let tmpValue = msg.reset ? 0 : value;

			if( msg.payload === false || msg.payload === 0 ) {
				tmpValue <<= 1;
			} else if( msg.payload === true || msg.payload === 1 ) {
				tmpValue = ( tmpValue << 1 ) | 1;
			}

			for( let idx = 0; idx < config.outputs; idx++ ) {
				msgs.push( ( ( tmpValue >> idx ) & 1 ) !== ( ( value >> idx ) & 1 ) ? {
					name: config.name,
					topic: config.topic,
					payload: config.output == 1 ? ( ( tmpValue >> idx ) & 1 ) === 1 : ( tmpValue >> idx ) & 1
				} : null );
			}

			value = tmpValue & ( Math.pow( 2, config.outputs ) - 1 );

			updateStatus( true );
			this.send( msgs );
		} );
	} );
};