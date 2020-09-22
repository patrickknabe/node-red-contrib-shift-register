module.exports = RED => {
	RED.nodes.registerType( 'shift-register', function( config ) {
		RED.nodes.createNode( this, config );

		let status = 0;

		this.status( { fill: 'grey', shape: 'dot', text: 'inactive' } );

		this.on( 'input', msg => {
			let tmpStatus = msg.reset ? 0 : status;

			if( msg.payload === false || msg.payload === true ) {
				tmpStatus <<= 1;

				if( msg.payload ) {
					tmpStatus |= 1;
				}
			} else if( Number.isInteger( msg.payload ) ) {
				console.log( 'Number', msg.payload );
				for( let idx = 0; msg.payload <= Math.pow( 2, idx ); idx++ ) {
					tmpStatus <<= 1;
console.log( '**', idx, msg.payload & ( 1 << idx ) );
					if( ( msg.payload & ( 1 << idx ) ) > 0 ) {
						tmpStatus |= 1;
					}
				}
			} else if( Array.isArray( msg.payload ) ) {
				for( let val of msg.payload ) {
					tmpStatus <<= 1;

					if( val === true || val === 1 ) {
						tmpStatus |= 1;
					}
				}
			}

			status = tmpStatus;
			console.log( status );
		} );
	} );
};