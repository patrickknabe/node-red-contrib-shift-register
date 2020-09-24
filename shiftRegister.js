module.exports = RED => {
	RED.nodes.registerType( 'shift register', function( config ) {
		RED.nodes.createNode( this, config );

		let val;

		const updateStatus = flash => {
			let text = '';

			for( let idx = 0; idx < config.outputs; idx++ ) {
				text = `${ ( val >> idx ) & 1 }${ text }`
			}

			if( flash ) {
				this.status( { fill: 'green', shape: 'dot', text } );
				setTimeout( updateStatus, 250, false );
			} else {
				this.status( { fill: 'grey', shape: 'dot', text } );
			}
		};

		val = !config.init ? 0 : Math.pow( 2, config.outputs ) - 1;
		!config.init ? updateStatus( false ) : this.emit( 'input', { reset: true } );

		this.on( 'input', msg => {
			const msgs = [];
			let tmpVal = msg.reset ? 0 : val;
			const tsp = new Date().getTime();

			if( msg.payload === false || msg.payload === 0 ) {
				tmpVal <<= 1;
			} else if( msg.payload === true || msg.payload === 1 ) {
				tmpVal = ( tmpVal << 1 ) | 1;
			}

			for( let idx = 0; idx < config.outputs; idx++ ) {
				msgs.push( ( ( tmpVal >> idx ) & 1 ) !== ( ( val >> idx ) & 1 ) ? {
					name: config.name,
					topic: config.topic,
					payload: config.output == 1 ? ( ( tmpVal >> idx ) & 1 ) === 1 : ( tmpVal >> idx ) & 1,
					index: idx,
					timestamp: tsp
				} : null );
			}

			val = tmpVal & ( Math.pow( 2, config.outputs ) - 1 );

			updateStatus( msg._msgid !== undefined );
			this.send( msgs );
		} );
	} );
};